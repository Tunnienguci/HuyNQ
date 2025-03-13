"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  PlusCircle,
  ExternalLink,
  Trash2,
  Filter,
  MoreHorizontal,
} from "lucide-react";

interface Url {
  _id: string;
  url: string;
  createdAt: string;
}

export function UrlList() {
  const [urls, setUrls] = useState<Url[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);

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

  const fetchUrls = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/urls");

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          throw new Error(data.message || "Không thể tải danh sách URL");
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();
      setUrls(data);
    } catch (err: any) {
      console.error("Error fetching URLs:", err);
      setError(err.message || "Có lỗi xảy ra khi tải danh sách URL");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa URL này?")) {
      return;
    }

    try {
      const response = await fetch(`/api/urls/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          throw new Error(data.message || "Không thể xóa URL");
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      // Remove the deleted URL from the list with animation
      const element = document.getElementById(`url-${id}`);
      if (element) {
        element.style.opacity = "0";
        element.style.transform = "translateY(10px)";
        element.style.transition = "all 0.3s ease-out";

        setTimeout(() => {
          setUrls(urls.filter((url) => url._id !== id));
        }, 300);
      }
    } catch (err: any) {
      console.error("Error deleting URL:", err);
      alert(err.message || "Có lỗi xảy ra khi xóa URL");
    }
  };

  const toggleSelectUrl = (id: string) => {
    setSelectedUrls((prev) =>
      prev.includes(id) ? prev.filter((urlId) => urlId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedUrls((prev) =>
      prev.length === urls.length ? [] : urls.map((url) => url._id)
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedUrls.length === 0) return;

    if (
      !confirm(`Bạn có chắc chắn muốn xóa ${selectedUrls.length} URL đã chọn?`)
    ) {
      return;
    }

    try {
      // Delete each selected URL
      for (const id of selectedUrls) {
        await fetch(`/api/urls/${id}`, {
          method: "DELETE",
        });
      }

      // Update the list
      setUrls(urls.filter((url) => !selectedUrls.includes(url._id)));
      setSelectedUrls([]);
    } catch (err: any) {
      alert(err.message || "Có lỗi xảy ra khi xóa URL");
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  // Tối ưu hiển thị URL cho thiết bị di động
  const formatUrl = (url: string) => {
    if (!isMobile) return url;

    try {
      const urlObj = new URL(url);
      return urlObj.hostname + (urlObj.pathname !== "/" ? urlObj.pathname : "");
    } catch {
      return url;
    }
  };

  if (loading) {
    return (
      <div className="container animate-fade-in">
        <div className="header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="title">URLs</h1>
              <p className="subtitle">Quản lý danh sách URL của bạn</p>
            </div>
          </div>
        </div>
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách URL...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container animate-fade-in">
        <div className="header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="title">URLs</h1>
              <p className="subtitle">Quản lý danh sách URL của bạn</p>
            </div>
          </div>
        </div>
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchUrls} className="button button-primary mt-4">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <div className="header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="title">URLs</h1>
            <p className="subtitle">Quản lý danh sách URL của bạn</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/create" className="button button-primary">
              <PlusCircle className="w-4 h-4 mr-1" />
              {isMobile ? " Thêm" : " Thêm URL mới"}
            </Link>
          </div>
        </div>
      </div>

      {urls.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📋</div>
          <h3 className="empty-title">Chưa có URL nào</h3>
          <p className="empty-description">
            Thêm URL đầu tiên của bạn để bắt đầu.
          </p>
          <Link
            href="/create"
            className="button button-primary mt-4 inline-flex items-center"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Tạo URL mới
          </Link>
        </div>
      ) : (
        <div className="content">
          {selectedUrls.length > 0 && (
            <div className="selection-bar">
              <div className="selection-info">
                Đã chọn {selectedUrls.length} URL
              </div>
              <div className="selection-actions">
                <button
                  onClick={handleDeleteSelected}
                  className="button button-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isMobile ? "Xóa" : "Xóa đã chọn"}
                </button>
              </div>
            </div>
          )}

          <div className="table">
            {!isMobile && (
              <div className="table-header">
                <div className="table-row">
                  <div className="table-cell checkbox">
                    <input
                      type="checkbox"
                      checked={
                        selectedUrls.length === urls.length && urls.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="checkbox-input"
                    />
                  </div>
                  <div className="table-cell">URL</div>
                  <div className="table-cell">Ngày tạo</div>
                  <div className="table-cell">Thao tác</div>
                </div>
              </div>
            )}

            <div className="table-body">
              {urls.map((url) => (
                <div
                  key={url._id}
                  id={`url-${url._id}`}
                  className="table-row animate-fade-in"
                >
                  {!isMobile && (
                    <div className="table-cell checkbox">
                      <input
                        type="checkbox"
                        checked={selectedUrls.includes(url._id)}
                        onChange={() => toggleSelectUrl(url._id)}
                        className="checkbox-input"
                      />
                    </div>
                  )}

                  <div className="table-cell url-cell">
                    <div className="url-text">{formatUrl(url.url)}</div>
                    {isMobile && (
                      <div className="date-cell">
                        {/* {new Date(url.createdAt).toLocaleDateString("vi-VN")} */}
                      </div>
                    )}
                  </div>

                  {!isMobile && (
                    <div className="table-cell date-cell">
                      {new Date(url.createdAt).toLocaleString("vi-VN")}
                    </div>
                  )}

                  <div className="table-cell actions-cell">
                    <div className="actions">
                      <a
                        href={url.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-button action-open"
                        title="Mở liên kết"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(url._id)}
                        className="action-button action-delete"
                        title="Xóa URL"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {!isMobile && (
                        <button className="action-button action-more">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
