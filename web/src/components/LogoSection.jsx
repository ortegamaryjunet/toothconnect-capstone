import React from "react";

export default function LogoSection({
  api,
  styles,
  websiteContent = {},
  websiteContentForm = {},
  websiteContentEditing,
  setWebsiteContent,
  setWebsiteContentForm,
  contentEditActions,
  showWebsiteValidationModal,
}) {
  const baseURL = api?.defaults?.baseURL
    ? api.defaults.baseURL.replace("/api", "")
    : "";

  const logoPath =
    websiteContentForm.website_logo_path ??
    websiteContent.website_logo_path;

  const logoFit =
    websiteContentForm.website_logo_fit ||
    websiteContent.website_logo_fit ||
    "contain";

  const logoSrc = logoPath
    ? logoPath.startsWith("http") || logoPath.startsWith("blob:")
      ? logoPath
      : `${baseURL}${logoPath}`
    : null;

  const showModal = (title, message) => {
    if (typeof showWebsiteValidationModal === "function") {
      showWebsiteValidationModal(title, message);
    } else {
      console.error(title, message);
    }
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!api) {
      showModal(
        "Upload Failed",
        "API service is unavailable."
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("logo", file);

      const response = await api.post(
        "/website/upload-logo",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const uploadedPath = response.data.path;

      if (typeof setWebsiteContent === "function") {
        setWebsiteContent((prev) => ({
          ...prev,
          website_logo_path: uploadedPath,
        }));
      }

      if (typeof setWebsiteContentForm === "function") {
        setWebsiteContentForm((prev) => ({
          ...prev,
          website_logo_path: uploadedPath,
        }));
      }
    } catch (err) {
      console.error(err);

      showModal(
        "Upload Failed",
        err.response?.data?.message ||
          "Unable to upload the website logo. Please try again."
      );
    }

    event.target.value = "";
  };

  return (
    <div style={styles.logoCard}>
      <div style={styles.logoPreviewPanel}>
        <div style={styles.logoPreview}>
          {logoSrc ? (
            <img
              src={logoSrc}
              alt="Website Logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: logoFit,
                objectPosition: "center",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#94a3b8",
                fontSize: 14,
                textAlign: "center",
                padding: 20,
              }}
            >
              No logo uploaded
            </div>
          )}
        </div>

        <h3 style={styles.logoHeading}>
          Website Logo
        </h3>

        <p style={styles.logoText}>
          Upload a logo from your computer or mobile device.
          Changes will appear throughout the website after saving.
        </p>
      </div>

      <div style={styles.logoRight}>
        <label
          style={{
            ...styles.logoUploadBtn,
            ...(websiteContentEditing
              ? {}
              : styles.logoUploadBtnDisabled),
          }}
        >
          <i className="fi fi-rr-picture"></i>

          <span>Choose Logo</span>

          <input
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml"
            hidden
            disabled={!websiteContentEditing}
            onChange={handleLogoUpload}
          />
        </label>

        <div style={styles.logoInfo}>
          Supported formats: PNG, JPG, WEBP and SVG
        </div>

        <div style={styles.logoOption}>
          <label style={styles.websiteFieldLabel}>
            Logo Display
          </label>

          <div style={styles.logoSelectWrapper}>
            <select
              value={logoFit}
              disabled={!websiteContentEditing}
              onChange={(event) => {
                if (typeof setWebsiteContentForm === "function") {
                  setWebsiteContentForm((prev) => ({
                    ...prev,
                    website_logo_fit: event.target.value,
                  }));
                }
              }}
              style={styles.logoSelect}
            >
              <option value="contain">Contain</option>
              <option value="cover">Cover</option>
              <option value="fill">Fill</option>
              <option value="scale-down">Scale Down</option>
              <option value="none">Original Size</option>
            </select>

            <i
              className="fi fi-rr-angle-small-down"
              style={styles.logoSelectIcon}
            ></i>
          </div>
        </div>
      </div>

      {websiteContentEditing &&
        contentEditActions(
          {
            website_logo_path:
              websiteContentForm.website_logo_path,
            website_logo_fit:
              websiteContentForm.website_logo_fit,
          },
          ["website_logo_path"]
        )}
    </div>
  );
}