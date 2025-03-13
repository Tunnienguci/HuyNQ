"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, X, Loader2, LinkIcon } from "lucide-react";

interface UrlInput {
  url: string;
  status: "typing" | "validating" | "valid" | "error";
  error?: string;
}

export function UrlForm() {
  const [urlInputs, setUrlInputs] = useState<UrlInput[]>([
    { url: "", status: "typing" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // Kiểm tra thiết bị di động
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const addUrlInput = () => {
    setUrlInputs((prev) => [...prev, { url: "", status: "typing" }]);
  };

  const removeUrlInput = (index: number) => {
    const element = document.getElementById(`url-input-${index}`);
    if (element) {
      element.style.opacity = "0";
      element.style.transform = "translateY(10px)";
      element.style.transition = "all 0.3s ease-out";

      setTimeout(() => {
        setUrlInputs((prev) => prev.filter((_, i) => i !== index));
      }, 300);
    }
  };

  const updateUrlInput = (index: number, url: string) => {
    setUrlInputs((prev) =>
      prev.map((input, i) =>
        i === index ? { ...input, url, status: "typing" } : input
      )
    );
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleBlur = (index: number) => {
    const input = urlInputs[index];
    if (!input.url) return;

    setUrlInputs((prev) =>
      prev.map((input, i) =>
        i === index
          ? {
              ...input,
              status: validateUrl(input.url) ? "valid" : "error",
              error: validateUrl(input.url) ? undefined : "URL không hợp lệ",
            }
          : input
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all URLs
    const validatedInputs: UrlInput[] = urlInputs.map((input) => ({
      ...input,
      status: validateUrl(input.url) ? "valid" : "error",
      error: validateUrl(input.url) ? undefined : "URL không hợp lệ",
    }));

    setUrlInputs(validatedInputs);

    const validUrls = validatedInputs.filter(
      (input) => input.status === "valid"
    );
    if (validUrls.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit each valid URL
      for (const input of validUrls) {
        const response = await fetch("/api/urls", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: input.url }),
        });

        if (!response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            throw new Error(data.message || "Có lỗi xảy ra khi lưu URL");
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }
      }

      // Redirect to home page after successful submission
      router.push("/");
      router.refresh();
    } catch (err: any) {
      console.error("Error submitting URLs:", err);
      alert(err.message || "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tự động thêm https:// nếu người dùng không nhập
  const handlePaste = (
    index: number,
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");

    if (pastedText && !pastedText.match(/^https?:\/\//i)) {
      updateUrlInput(index, `https://${pastedText}`);
    } else {
      updateUrlInput(index, pastedText);
    }
  };

  return (
    <div className="container animate-fade-in">
      <div className="header">
        <h1 className="title">Thêm URL mới</h1>
        <p className="subtitle">
          Thêm một hoặc nhiều URL vào danh sách của bạn
        </p>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <div className="url-inputs">
          {urlInputs.map((input, index) => (
            <div
              key={index}
              id={`url-input-${index}`}
              className="url-input-group animate-fade-in"
            >
              <div className="url-input-container">
                <div className="url-input-icon">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  inputMode="url"
                  value={input.url}
                  onChange={(e) => updateUrlInput(index, e.target.value)}
                  onBlur={() => handleBlur(index)}
                  onPaste={(e) => handlePaste(index, e)}
                  placeholder="https://example.com"
                  className={`url-input ${
                    input.status === "error"
                      ? "error"
                      : input.status === "valid"
                      ? "success"
                      : ""
                  }`}
                  disabled={isSubmitting}
                  autoCapitalize="off"
                  autoCorrect="off"
                  autoComplete="url"
                />
                {urlInputs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeUrlInput(index)}
                    className="remove-button"
                    disabled={isSubmitting}
                    aria-label="Xóa URL"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {input.error && <p className="error-message">{input.error}</p>}
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={addUrlInput}
            className="button button-secondary"
            disabled={isSubmitting}
          >
            <PlusCircle className="w-4 h-4 mr-1" />
            {isMobile ? "Thêm URL" : "Thêm URL khác"}
          </button>

          <button
            type="submit"
            className="button button-primary"
            disabled={isSubmitting || urlInputs.every((input) => !input.url)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isMobile ? "Đang lưu..." : "Đang lưu..."}
              </>
            ) : isMobile ? (
              "Lưu"
            ) : (
              "Lưu URL"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
