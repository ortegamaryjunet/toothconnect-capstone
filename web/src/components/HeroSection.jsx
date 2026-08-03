import React from "react";

export default function HeroSection({ api, styles, websiteContent, websiteContentForm, websiteContentEditing, setWebsiteContent, setWebsiteContentForm, showWebsiteValidationModal, fieldRow, textDesignFields, contentEditActions, collectFieldsByPrefixes, }) {
  const baseURL = api?.defaults?.baseURL
    ? api.defaults.baseURL.replace("/api", "")
    : "";

  const imagePath =
    websiteContentForm.hero_dentist_image ??
    websiteContent.hero_dentist_image;

  const imageFit =
    websiteContentForm.hero_dentist_image_fit ||
    websiteContent.hero_dentist_image_fit ||
    "contain";

  const imageSrc = imagePath
    ? imagePath.startsWith("http") ||
      imagePath.startsWith("blob:")
      ? imagePath
      : `${baseURL}${imagePath}`
    : null;

  const showModal = (title, message) => {
    if (typeof showWebsiteValidationModal === "function") {
      showWebsiteValidationModal(title, message);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

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

      formData.append("heroImage", file);

      const response = await api.post( "/website/upload-hero-image", formData,
        { headers: { Authorization: `Bearer ${token}`, }, }
      );

      const uploadedPath = response.data.path;

      setWebsiteContent((prev) => ({
        ...prev,
        hero_dentist_image: uploadedPath,
      }));

      setWebsiteContentForm((prev) => ({
        ...prev,
        hero_dentist_image: uploadedPath,
      }));
    } catch (err) {
      console.error(err);

      showModal(
        "Upload Failed",
        err.response?.data?.message ||
          "Unable to upload the featured dentist image."
      );
    }

    event.target.value = "";
  };
  console.log(websiteContentForm);

  console.log(
  websiteContentForm.hero_stat1_value_text_color,
  websiteContentForm.hero_stat2_value_text_color,
  websiteContentForm.hero_stat3_value_text_color
);

  return (
    <div>
      <h3 style={styles.sectionTitle}>Featured Dentist Image</h3>

      <div style={styles.logoCard}>
        <div style={styles.logoPreviewPanel}>
      <div style={styles.logoPreview}>
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="Featured Dentist"
            style={{
              width: "100%",
              height: "100%",
              objectFit: imageFit,
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
              fontFamily: "Arial, sans-serif",
            }}
          >
        No image uploaded
      </div>
    )}
  </div>

  <h3 style={styles.logoHeading}>
    Featured Dentist Image
  </h3>

  <p style={styles.logoText}>
    Upload the featured dentist image displayed on the homepage.
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

    <span>Choose Image</span>

    <input
      type="file"
      accept="image/png,image/jpeg,image/webp,image/svg+xml"
      hidden
      disabled={!websiteContentEditing}
      onChange={handleImageUpload}
    />
  </label>

  <div style={styles.logoInfo}>Supported formats: PNG, JPG, WEBP and SVG</div>

  <div style={styles.logoOption}>
    <label style={styles.websiteFieldLabel}>Image Display</label>

    <div style={styles.logoSelectWrapper}>
      <select
        value={imageFit}
        disabled={!websiteContentEditing}
        onChange={(event) =>
          setWebsiteContentForm((prev) => ({
            ...prev,
            hero_dentist_image_fit:
              event.target.value,
          }))
        }
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

</div>

<h3 style={styles.websiteSectionTitle}>Hero Content</h3>
<div style={styles.websiteFieldsGrid}><div>{fieldRow("Motto Text","hero_eyebrow")}</div><div style={styles.websiteFields}>{textDesignFields("hero_eyebrow","Eyebrow")}</div></div>
<div style={styles.websiteFieldsGrid}><div>{fieldRow("Heading","hero_heading","textarea")}</div><div style={styles.websiteFields}>{textDesignFields("hero_heading","Heading")}</div></div>
<div style={styles.websiteFieldsGrid}><div>{fieldRow("Description","hero_description","textarea")}</div><div style={styles.websiteFields}>{textDesignFields("hero_description","Description")}</div></div>
<div style={styles.websiteFieldsGrid}><div>{fieldRow("Button Label","hero_button_label")}</div><div style={styles.websiteFields}>{textDesignFields("hero_button_label","Button Label")}</div></div>

<h3 style={styles.websiteSectionTitle}>Statistics</h3>
<div style={styles.websiteFieldsGrid}><div>{fieldRow("Statistic 1 Value","hero_stat1_value")}</div><div style={styles.websiteFields}>{textDesignFields("hero_stat1_value","Statistic 1 Value")}</div></div>
<div style={styles.websiteFieldsGrid}><div>{fieldRow("Statistic 1 Label","hero_stat1_label")}</div><div style={styles.websiteFields}>{textDesignFields("hero_stat1_label","Statistic 1 Label")}</div></div>
<div style={styles.websiteFieldsGrid}><div>{fieldRow("Statistic 2 Value","hero_stat2_value")}</div><div style={styles.websiteFields}>{textDesignFields("hero_stat2_value","Statistic 2 Value")}</div></div>
<div style={styles.websiteFieldsGrid}><div>{fieldRow("Statistic 2 Label","hero_stat2_label")}</div><div style={styles.websiteFields}>{textDesignFields("hero_stat2_label","Statistic 2 Label")}</div></div>
<div style={styles.websiteFieldsGrid}><div>{fieldRow("Statistic 3 Value","hero_stat3_value")}</div><div style={styles.websiteFields}>{textDesignFields("hero_stat3_value","Statistic 3 Value")}</div></div>
<div style={styles.websiteFieldsGrid}><div>{fieldRow("Statistic 3 Label","hero_stat3_label")}</div><div style={styles.websiteFields}>{textDesignFields("hero_stat3_label","Statistic 3 Label")}</div></div>

<h3 style={styles.websiteSectionTitle}>Featured Dentist</h3>
<div style={styles.websiteFieldsGrid}><div>{fieldRow("Dentist Name","hero_dentist_name")}</div><div style={styles.websiteFields}>{textDesignFields("hero_dentist_name","Dentist Name")}</div></div>
<div style={styles.websiteFieldsGrid}><div>{fieldRow("Dentist Title","hero_dentist_title")}</div><div style={styles.websiteFields}>{textDesignFields("hero_dentist_title","Dentist Title")}</div></div>

<h3 style={styles.websiteSectionTitle}>Booking Card</h3>
<div style={styles.websiteFieldsGrid}><div>{fieldRow("Booking Title","hero_booking_title")}</div><div style={styles.websiteFields}>{textDesignFields("hero_booking_title","Booking Title")}</div></div>
<div style={styles.websiteFieldsGrid}><div>{fieldRow("Booking Subtitle","hero_booking_subtitle")}</div><div style={styles.websiteFields}>{textDesignFields("hero_booking_subtitle","Booking Subtitle")}</div></div>

    {websiteContentEditing &&
      contentEditActions(
        collectFieldsByPrefixes(["hero_"]),
        [
          "hero_heading",
          "hero_description",
          "hero_button_label",
          "hero_stat1_value",
          "hero_stat1_label",
          "hero_stat2_value",
          "hero_stat2_label",
          "hero_stat3_value",
          "hero_stat3_label",
          "hero_dentist_name",
          "hero_dentist_title",
          "hero_booking_title",
          "hero_booking_subtitle",
          "hero_dentist_image",
        ]
      )}
    </div>
  );
}