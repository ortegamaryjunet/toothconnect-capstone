import React from "react";

export default function AboutSection({
  api,
  styles,
  fieldRow,
  textDesignFields,
  websiteContentEditing,
  websiteContent,
  websiteContentForm,
  setWebsiteContent,
  setWebsiteContentForm,
  contentEditActions,
  collectFieldsByPrefixes,
}) {
  const baseURL = api?.defaults?.baseURL ? api.defaults.baseURL.replace("/api", "") : "";

  const getImageSrc = (field) => {
    const path = websiteContentForm[field] || websiteContent[field];

    if (!path) return null;

    return path.startsWith("http") ||
      path.startsWith("blob:")
      ? path
      : `${baseURL}${path}`;
  };

  const ownerImage = getImageSrc("owner_image");

  const handleOwnerImageUpload = async (event, field) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!api) {
      console.error("API service is unavailable.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("image", file);
      formData.append("field", field);

      const response = await api.post(
        "/website/upload-team-image",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

    const uploadedPath = response.data.path || response.data.url || response.data.secure_url;

    setWebsiteContentForm((prev) => ({
      ...prev,
      [field]: uploadedPath,
    }));
    } catch (err) {
      console.error(err);
    }

    event.target.value = "";
  };

  const imageUploadCard = (
    title,
    description,
    imageSrc,
    imageField
  ) => (
    <div
      style={{
        ...styles.logoCard,
        alignItems: "stretch",
        gap: 28,
        marginBottom: 28,
      }}
    >
      <div
        style={{
          ...styles.logoPreviewPanel,
          flex: 1,
        }}
      >
        <div
          style={{
            ...styles.logoPreview,
            borderRadius: 18,
            overflow: "hidden",
            background: "#f8fafc",
          }}
        >
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#94a3b8",
                gap: 12,
                fontFamily: "Arial, sans-serif",
              }}
            >
              <i
                className="fi fi-rr-picture"
                style={{
                  fontSize: 42,
                }}
              />

              <span
                style={{
                  fontSize: 14,
                }}
              >
                No image uploaded
              </span>
            </div>
          )}
        </div>

        <h3
          style={{
            ...styles.logoHeading,
            marginTop: 20,
          }}
        >
          {title}
        </h3>

        <p
          style={{
            ...styles.logoText,
            lineHeight: 1.7,
          }}
        >
          {description}
        </p>
      </div>

      <div
        style={{
          ...styles.logoRight,
          width: 260,
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <label
          style={{
            width: "80%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "14px 18px",
            border: "1px solid #d9a514",
            borderRadius: 14,
            backgroundColor: websiteContentEditing
              ? "#ffffff"
              : "#f8fafc",
            color: "#c58b00",
            fontFamily: "Arial, sans-serif",
            fontSize: 15,
            fontWeight: 700,
            lineHeight: 1,
            cursor: websiteContentEditing
              ? "pointer"
              : "not-allowed",
            opacity: websiteContentEditing ? 1 : 0.6,
            transition: "all 0.2s ease",
            boxSizing: "border-box",
            userSelect: "none",
          }}
        >
          <i className="fi fi-rr-picture"></i>

          <span>Choose Image</span>

          <input
            type="file"
            hidden
            accept="image/png,image/jpeg,image/webp"
            disabled={!websiteContentEditing}
            onChange={(e) =>
              handleOwnerImageUpload(e, imageField)
            }
          />
        </label>

        <div
          style={{
            ...styles.logoInfo,
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          Supported formats:
          <br />
          PNG, JPG and WEBP
        </div>
      </div>
    </div>
  );


  return (
    <div>
      <h3 style={styles.websiteSectionTitle}>Hero Section</h3>

      <div style={styles.websiteFieldsGrid}>
        <div>
          {fieldRow("Hero Tag", "about_hero_tag")}
        </div>

        <div style={styles.websiteFields}>
          {textDesignFields("about_hero_tag", "Hero Tag")}
        </div>
      </div>

      <div style={styles.websiteFieldsGrid}>
        <div>
          {fieldRow("Hero Title", "about_hero_title")}
        </div>

        <div style={styles.websiteFields}>
          {textDesignFields("about_hero_title", "Hero Title")}
        </div>
      </div>

      <div style={styles.websiteFieldsGrid}>
        <div>
          {fieldRow("Hero Description", "about_hero_description", "textarea")}
        </div>

        <div style={styles.websiteFields}>
          {textDesignFields("about_hero_description", "Hero Description")}
        </div>
      </div>

      <div style={styles.websiteFieldsGrid}>
        <div>
          {fieldRow("View Branches Button", "view_branches_button_text")}
        </div>

        <div style={styles.websiteFields}>
          {textDesignFields("view_branches_button", "View Branches Button")}
        </div>
      </div>

      <div style={styles.websiteFieldsGrid}>
        <div>
          {fieldRow("Meet Team Button", "meet_team_button_text")}
        </div>

        <div style={styles.websiteFields}>
          {textDesignFields("meet_team_button", "Meet Team Button")}
        </div>
      </div>

      <h3 style={styles.websiteSectionTitle}>Hero Card</h3>

      <div style={styles.websiteFieldsGrid}>
        <div>
          {fieldRow("Hero Card Title", "hero_card_title")}
        </div>

        <div style={styles.websiteFields}>
          {textDesignFields("hero_card_title", "Hero Card Title")}
        </div>
      </div>

      <div style={styles.websiteFieldsGrid}>
        <div>
          {fieldRow("Hero Card Description", "hero_card_description", "textarea")}
        </div>

        <div style={styles.websiteFields}>
          {textDesignFields("hero_card_description", "Hero Card Description")}
        </div>
      </div>

      <div style={styles.websiteFieldsGrid}>
        <div>
          {fieldRow("Branch Count Label", "branch_count_label")}
        </div>

        <div style={styles.websiteFields}>
          {textDesignFields("branch_count_label", "Branch Count Label")}
        </div>
      </div>

      <div style={styles.websiteFieldsGrid}>
        <div>
          {fieldRow("Care Team Count Label", "care_team_count_label")}
        </div>

        <div style={styles.websiteFields}>
          {textDesignFields("care_team_count_label", "Care Team Count Label")}
        </div>
      </div>

      <h3 style={styles.websiteSectionTitle}>Who We Are</h3>

      <div style={styles.websiteFieldsGrid}>
        <div>
          {fieldRow("Who We Are Tag", "who_we_are_tag")}
        </div>

        <div style={styles.websiteFields}>
          {textDesignFields("who_we_are_tag", "Who We Are Tag")}
        </div>
      </div>

      <div style={styles.websiteFieldsGrid}>
        <div>
          {fieldRow("Who We Are Title", "who_we_are_title")}
        </div>

        <div style={styles.websiteFields}>
          {textDesignFields("who_we_are_title", "Who We Are Title")}
        </div>
      </div>

      <div style={styles.websiteFieldsGrid}>
        <div>
          {fieldRow("Who We Are Description", "who_we_are_description", "textarea")}
        </div>

        <div style={styles.websiteFields}>
          {textDesignFields("who_we_are_description", "Who We Are Description")}
        </div>
      </div>

      <h3 style={styles.websiteSectionTitle}>Mission</h3>

      <div style={styles.websiteFieldsGrid}>
        <div>
          {fieldRow("Mission Title", "mission_title")}
        </div>

        <div style={styles.websiteFields}>
          {textDesignFields("mission_title", "Mission Title")}
        </div>
      </div>

      <div style={styles.websiteFieldsGrid}>
        <div>
          {fieldRow("Mission Content", "mission_content", "textarea")}
        </div>

        <div style={styles.websiteFields}>
          {textDesignFields("mission_content", "Mission Content")}
        </div>
      </div>

      <h3 style={styles.websiteSectionTitle}>Vision</h3>

      <div style={styles.websiteFieldsGrid}>
        <div>
          {fieldRow("Vision Title", "vision_title")}
        </div>

        <div style={styles.websiteFields}>
          {textDesignFields("vision_title", "Vision Title")}
        </div>
      </div>

      <div style={styles.websiteFieldsGrid}>
        <div>
          {fieldRow("Vision Content", "vision_content", "textarea")}
        </div>

        <div style={styles.websiteFields}>
          {textDesignFields("vision_content", "Vision Content")}
        </div>
      </div>

      <h3 style={styles.websiteSectionTitle}>Our Care</h3>

      <div style={styles.websiteFieldsGrid}>
        <div>
          {fieldRow("Care Title", "care_title")}
        </div>

        <div style={styles.websiteFields}>
          {textDesignFields("care_title", "Care Title")}
        </div>
      </div>

      <div style={styles.websiteFieldsGrid}>
        <div>
          {fieldRow("Care Content", "care_content", "textarea")}
        </div>

        <div style={styles.websiteFields}>
          {textDesignFields("care_content", "Care Content")}
        </div>
      </div>

      <h3 style={styles.websiteSectionTitle}>Team Section</h3>

      <div style={styles.websiteFieldsGrid}>
        <div>
          {fieldRow("Team Section Tag", "team_section_tag")}
        </div>

        <div style={styles.websiteFields}>
          {textDesignFields("team_section_tag", "Team Section Tag")}
        </div>
      </div>

      <div style={styles.websiteFieldsGrid}>
        <div>
          {fieldRow("Team Section Title", "team_section_title")}
        </div>

        <div style={styles.websiteFields}>
          {textDesignFields("team_section_title", "Team Section Title")}
        </div>
      </div>

      <div style={styles.websiteFieldsGrid}>
        <div>
          {fieldRow("Team Section Description", "team_section_description", "textarea")}
        </div>

        <div style={styles.websiteFields}>
          {textDesignFields("team_section_description", "Team Section Description")}
        </div>
      </div>

      <h3 style={styles.websiteSectionTitle}>Owner</h3>

      {imageUploadCard("Owner Image", "Upload the clinic owner's image.", ownerImage, "owner_image")}

      <div style={styles.websiteFieldsGrid}>
        <div>
          {fieldRow("Owner Message 1", "owner_message1", "textarea")}
        </div>

        <div style={styles.websiteFields}>
          {textDesignFields("owner_message1", "Owner Message 1")}
        </div>
      </div>

      <div style={styles.websiteFieldsGrid}>
        <div>
          {fieldRow("Owner Message 2", "owner_message2", "textarea")}
        </div>

        <div style={styles.websiteFields}>
          {textDesignFields("owner_message2", "Owner Message 2")}
        </div>
      </div>

      <div style={styles.websiteFieldsGrid}>
        <div>
          {fieldRow("Owner Label", "owner_label")}
        </div>

        <div style={styles.websiteFields}>
          {textDesignFields("owner_label", "Owner Label")}
        </div>
      </div>

      <div style={styles.websiteFieldsGrid}>
        <div>
          {fieldRow("Owner Name", "owner_name")}
        </div>

        <div style={styles.websiteFields}>
          {textDesignFields("owner_name", "Owner Name")}
        </div>
      </div>

      <div style={styles.websiteFieldsGrid}>
        <div>
          {fieldRow("Owner Position", "owner_position")}
        </div>

        <div style={styles.websiteFields}>
          {textDesignFields("owner_position", "Owner Position")}
        </div>
      </div>

      <h3 style={styles.websiteSectionTitle}>Branch Section</h3>

      <div style={styles.websiteFieldsGrid}>
        <div>
          {fieldRow("Branch Section Tag", "branch_section_tag")}
        </div>

        <div>
          {textDesignFields("branch_section_tag", "Branch Section Tag")}
        </div>
      </div>

      <div style={styles.websiteFieldsGrid}>
        <div>
          {fieldRow("Branch Section Title", "branch_section_title")}
        </div>

        <div>
          {textDesignFields("branch_section_title", "Branch Section Title")}
        </div>
      </div>

      <h3 style={styles.websiteSectionTitle}>Map Section</h3>

      <div style={styles.websiteFieldsGrid}>
        <div>
          {fieldRow("Map Section Tag", "map_section_tag")}
        </div>

        <div style={styles.websiteFields}>
          {textDesignFields("map_section_tag", "Map Section Tag")}
        </div>
      </div>

      <div style={styles.websiteFieldsGrid}>
        <div>
          {fieldRow("Map Section Title", "map_section_title")}
        </div>

        <div style={styles.websiteFields}>
          {textDesignFields("map_section_title", "Map Section Title")}
        </div>
      </div>

      <div style={styles.websiteFieldsGrid}>
        <div>
          {fieldRow("Map Section Description", "map_section_description", "textarea")}
        </div>

        <div style={styles.websiteFields}>
          {textDesignFields("map_section_description", "Map Section Description")}
        </div>
      </div>

      <h3 style={styles.websiteSectionTitle}>Footer</h3>

      <div style={styles.websiteFieldsGrid}>
        <div>
          {fieldRow("Footer Copyright", "footer_copyright")}
        </div>

        <div style={styles.websiteFields}>
          {textDesignFields("footer_copyright", "Footer Copyright")}
        </div>
      </div>

      {websiteContentEditing &&
        contentEditActions(
          collectFieldsByPrefixes([
            "about_",
            "hero_",
            "view_branches_button",
            "meet_team_button",
            "branch_count",
            "care_team_count",
            "who_we_are_",
            "mission_",
            "vision_",
            "care_",
            "team_section_",
            "owner_",
            "branch_section_",
            "map_section_",
            "footer_",
          ]),
          [
            "about_hero_tag",
            "about_hero_tag_font_family",
            "about_hero_tag_font_size",
            "about_hero_tag_font_weight",
            "about_hero_tag_font_style",
            "about_hero_tag_text_color",
            "about_hero_tag_text_alignment",

            "about_hero_title",
            "about_hero_title_font_family",
            "about_hero_title_font_size",
            "about_hero_title_font_weight",
            "about_hero_title_font_style",
            "about_hero_title_text_color",
            "about_hero_title_text_alignment",

            "about_hero_description",
            "about_hero_description_font_family",
            "about_hero_description_font_size",
            "about_hero_description_font_weight",
            "about_hero_description_font_style",
            "about_hero_description_text_color",
            "about_hero_description_text_alignment",

            "view_branches_button_text",
            "view_branches_button_font_family",
            "view_branches_button_font_size",
            "view_branches_button_font_weight",
            "view_branches_button_font_style",
            "view_branches_button_text_color",
            "view_branches_button_text_alignment",

            "meet_team_button_text",
            "meet_team_button_font_family",
            "meet_team_button_font_size",
            "meet_team_button_font_weight",
            "meet_team_button_font_style",
            "meet_team_button_text_color",
            "meet_team_button_text_alignment",

            "hero_card_title",
            "hero_card_title_font_family",
            "hero_card_title_font_size",
            "hero_card_title_font_weight",
            "hero_card_title_font_style",
            "hero_card_title_text_color",
            "hero_card_title_text_alignment",

            "hero_card_description",
            "hero_card_description_font_family",
            "hero_card_description_font_size",
            "hero_card_description_font_weight",
            "hero_card_description_font_style",
            "hero_card_description_text_color",
            "hero_card_description_text_alignment",

            "branch_count",
            "branch_count_font_family",
            "branch_count_font_size",
            "branch_count_font_weight",
            "branch_count_font_style",
            "branch_count_text_color",
            "branch_count_text_alignment",
            
            "branch_section_tag",
            "branch_section_tag_font_family",
            "branch_section_tag_font_size",
            "branch_section_tag_font_weight",
            "branch_section_tag_font_style",
            "branch_section_tag_text_color",
            "branch_section_tag_text_alignment",

            "branch_section_title",
            "branch_section_title_font_family",
            "branch_section_title_font_size",
            "branch_section_title_font_weight",
            "branch_section_title_font_style",
            "branch_section_title_text_color",
            "branch_section_title_text_alignment",

            "branch_count_label",
            "branch_count_label_font_family",
            "branch_count_label_font_size",
            "branch_count_label_font_weight",
            "branch_count_label_font_style",
            "branch_count_label_text_color",
            "branch_count_label_text_alignment",

            "care_team_count",
            "care_team_count_font_family",
            "care_team_count_font_size",
            "care_team_count_font_weight",
            "care_team_count_font_style",
            "care_team_count_text_color",
            "care_team_count_text_alignment",

            "care_team_count_label",
            "care_team_count_label_font_family",
            "care_team_count_label_font_size",
            "care_team_count_label_font_weight",
            "care_team_count_label_font_style",
            "care_team_count_text_color",
            "care_team_count_text_alignment",

            "who_we_are_tag",
            "who_we_are_tag_font_family",
            "who_we_are_tag_font_size",
            "who_we_are_tag_font_weight",
            "who_we_are_tag_font_style",
            "who_we_are_tag_text_color",
            "who_we_are_tag_text_alignment",

            "who_we_are_title",
            "who_we_are_title_font_family",
            "who_we_are_title_font_size",
            "who_we_are_title_font_weight",
            "who_we_are_title_font_style",
            "who_we_are_title_text_color",
            "who_we_are_title_text_alignment",

            "who_we_are_description",
            "who_we_are_description_font_family",
            "who_we_are_description_font_size",
            "who_we_are_description_font_weight",
            "who_we_are_description_font_style",
            "who_we_are_description_text_color",
            "who_we_are_description_text_alignment",

            "mission_title",
            "mission_title_font_family",
            "mission_title_font_size",
            "mission_title_font_weight",
            "mission_title_font_style",
            "mission_title_text_color",
            "mission_title_text_alignment",

            "mission_content",
            "mission_content_font_family",
            "mission_content_font_size",
            "mission_content_font_weight",
            "mission_content_font_style",
            "mission_content_text_color",
            "mission_content_text_alignment",

            "vision_title",
            "vision_title_font_family",
            "vision_title_font_size",
            "vision_title_font_weight",
            "vision_title_font_style",
            "vision_title_text_color",
            "vision_title_text_alignment",

            "vision_content",
            "vision_content_font_family",
            "vision_content_font_size",
            "vision_content_font_weight",
            "vision_content_font_style",
            "vision_content_text_color",
            "vision_content_text_alignment",

            "care_title",
            "care_title_font_family",
            "care_title_font_size",
            "care_title_font_weight",
            "care_title_font_style",
            "care_title_text_color",
            "care_title_text_alignment",

            "care_content",
            "care_content_font_family",
            "care_content_font_size",
            "care_content_font_weight",
            "care_content_font_style",
            "care_content_text_color",
            "care_content_text_alignment",

            "footer_copyright",
            "footer_copyright_font_family",
            "footer_copyright_font_size",
            "footer_copyright_font_weight",
            "footer_copyright_font_style",
            "footer_copyright_text_color",
            "footer_copyright_text_alignment",

            "team_section_tag",
            "team_section_tag_font_family",
            "team_section_tag_font_size",
            "team_section_tag_font_weight",
            "team_section_tag_font_style",
            "team_section_tag_text_color",
            "team_section_tag_text_alignment",

            "team_section_title",
            "team_section_title_font_family",
            "team_section_title_font_size",
            "team_section_title_font_weight",
            "team_section_title_font_style",
            "team_section_title_text_color",
            "team_section_title_text_alignment",

            "team_section_description",
            "team_section_description_font_family",
            "team_section_description_font_size",
            "team_section_description_font_weight",
            "team_section_description_font_style",
            "team_section_description_text_color",
            "team_section_description_text_alignment",

            "map_section_tag",
            "map_section_tag_font_family",
            "map_section_tag_font_size",
            "map_section_tag_font_weight",
            "map_section_tag_font_style",
            "map_section_tag_text_color",
            "map_section_tag_text_alignment",

            "map_section_title",
            "map_section_title_font_family",
            "map_section_title_font_size",
            "map_section_title_font_weight",
            "map_section_title_font_style",
            "map_section_title_text_color",
            "map_section_title_text_alignment",

            "map_section_description",
            "map_section_description_font_family",
            "map_section_description_font_size",
            "map_section_description_font_weight",
            "map_section_description_font_style",
            "map_section_description_text_color",
            "map_section_description_text_alignment",

            "owner_message1",
            "owner_message1_font_family",
            "owner_message1_font_size",
            "owner_message1_font_weight",
            "owner_message1_font_style",
            "owner_message1_text_color",
            "owner_message1_text_alignment",

            "owner_message2",
            "owner_message2_font_family",
            "owner_message2_font_size",
            "owner_message2_font_weight",
            "owner_message2_font_style",
            "owner_message2_text_color",
            "owner_message2_text_alignment",

            "owner_label",
            "owner_label_font_family",
            "owner_label_font_size",
            "owner_label_font_weight",
            "owner_label_font_style",
            "owner_label_text_color",
            "owner_label_text_alignment",

            "owner_name",
            "owner_name_font_family",
            "owner_name_font_size",
            "owner_name_font_weight",
            "owner_name_font_style",
            "owner_name_text_color",
            "owner_name_text_alignment",

            "owner_position",
            "owner_position_font_family",
            "owner_position_font_size",
            "owner_position_font_weight",
            "owner_position_font_style",
            "owner_position_text_color",
            "owner_position_text_alignment",

            "owner_image",
          ]
        )}
    </div>
  );
}