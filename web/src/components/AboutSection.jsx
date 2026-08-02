import React from "react";

export default function AboutSection({
  styles, fieldRow, textDesignFields, websiteContentEditing, contentEditActions, collectFieldsByPrefixes, }) {
  return (
    <div>
      <h3 style={styles.websiteSectionTitle}>Hero Section</h3>

      <div style={styles.websiteFieldsGrid}>
        <div>{fieldRow("Hero Tag", "about_hero_tag")}</div>

        <div style={styles.websiteFields}>{textDesignFields("about_hero_tag", "Hero Tag")}</div>
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
          {fieldRow("Branch Count", "branch_count")}
        </div>

        <div style={styles.websiteFields}>
          {textDesignFields("branch_count", "Branch Count")}
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
          {fieldRow("Care Team Count", "care_team_count")}
        </div>

        <div style={styles.websiteFields}>
          {textDesignFields("care_team_count", "Care Team Count")}
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

        <div style={styles.websiteFields}>{textDesignFields("mission_title", "Mission Title")}</div>
      </div>

      <div style={styles.websiteFieldsGrid}>
        <div>{fieldRow("Mission Content", "mission_content", "textarea")}</div>

        <div style={styles.websiteFields}>{textDesignFields("mission_content", "Mission Content")}</div>
      </div>

      <h3 style={styles.websiteSectionTitle}>Vision</h3>

      <div style={styles.websiteFieldsGrid}>
        <div>{fieldRow("Vision Title", "vision_title")}</div>

        <div style={styles.websiteFields}>{textDesignFields("vision_title", "Vision Title")}</div>
      </div>

      <div style={styles.websiteFieldsGrid}>
        <div>{fieldRow("Vision Content", "vision_content", "textarea")}</div>

        <div style={styles.websiteFields}>{textDesignFields("vision_content", "Vision Content")}</div>
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
          collectFieldsByPrefixes(["about_", "hero_", "view_branches_button_", "meet_team_button_", "branch_count_", "care_team_count_", "who_we_are_", "mission_", "vision_", "care_", "footer_"]),
          [
            "about_hero_tag", "about_hero_tag_font_family", "about_hero_tag_font_size", "about_hero_tag_font_weight", "about_hero_tag_font_style", "about_hero_tag_color", "about_hero_tag_alignment",
            "about_hero_title", "about_hero_title_font_family", "about_hero_title_font_size", "about_hero_title_font_weight", "about_hero_title_font_style", "about_hero_title_color", "about_hero_title_alignment",
            "about_hero_description", "about_hero_description_font_family", "about_hero_description_font_size", "about_hero_description_font_weight", "about_hero_description_font_style", "about_hero_description_color", "about_hero_description_alignment",
            "view_branches_button_text", "view_branches_button_font_family", "view_branches_button_font_size", "view_branches_button_font_weight", "view_branches_button_font_style", "view_branches_button_color", "view_branches_button_alignment",
            "meet_team_button_text", "meet_team_button_font_family", "meet_team_button_font_size", "meet_team_button_font_weight", "meet_team_button_font_style", "meet_team_button_color", "meet_team_button_alignment",
            "hero_card_title", "hero_card_title_font_family", "hero_card_title_font_size", "hero_card_title_font_weight", "hero_card_title_font_style", "hero_card_title_color", "hero_card_title_alignment",
            "hero_card_description", "hero_card_description_font_family", "hero_card_description_font_size", "hero_card_description_font_weight", "hero_card_description_font_style", "hero_card_description_color", "hero_card_description_alignment",
            "branch_count", "branch_count_font_family", "branch_count_font_size", "branch_count_font_weight", "branch_count_font_style", "branch_count_color", "branch_count_alignment",
            "branch_count_label", "branch_count_label_font_family", "branch_count_label_font_size", "branch_count_label_font_weight", "branch_count_label_font_style", "branch_count_label_color", "branch_count_label_alignment",
            "care_team_count", "care_team_count_font_family", "care_team_count_font_size", "care_team_count_font_weight", "care_team_count_font_style", "care_team_count_color", "care_team_count_alignment",
            "care_team_count_label", "care_team_count_label_font_family", "care_team_count_label_font_size", "care_team_count_label_font_weight", "care_team_count_label_font_style", "care_team_count_label_color", "care_team_count_label_alignment",
            "who_we_are_tag", "who_we_are_tag_font_family", "who_we_are_tag_font_size", "who_we_are_tag_font_weight", "who_we_are_tag_font_style", "who_we_are_tag_color", "who_we_are_tag_alignment",
            "who_we_are_title", "who_we_are_title_font_family", "who_we_are_title_font_size", "who_we_are_title_font_weight", "who_we_are_title_font_style", "who_we_are_title_color", "who_we_are_title_alignment",
            "who_we_are_description", "who_we_are_description_font_family", "who_we_are_description_font_size", "who_we_are_description_font_weight", "who_we_are_description_font_style", "who_we_are_description_color", "who_we_are_description_alignment",
            "mission_title", "mission_title_font_family", "mission_title_font_size", "mission_title_font_weight", "mission_title_font_style", "mission_title_color", "mission_title_alignment",
            "mission_content", "mission_content_font_family", "mission_content_font_size", "mission_content_font_weight", "mission_content_font_style", "mission_content_color", "mission_content_alignment",
            "vision_title", "vision_title_font_family", "vision_title_font_size", "vision_title_font_weight", "vision_title_font_style", "vision_title_color", "vision_title_alignment",
            "vision_content", "vision_content_font_family", "vision_content_font_size", "vision_content_font_weight", "vision_content_font_style", "vision_content_color", "vision_content_alignment",
            "care_title", "care_title_font_family", "care_title_font_size", "care_title_font_weight", "care_title_font_style", "care_title_color", "care_title_alignment",
            "care_content", "care_content_font_family", "care_content_font_size", "care_content_font_weight", "care_content_font_style", "care_content_color", "care_content_alignment",
            "footer_copyright", "footer_copyright_font_family", "footer_copyright_font_size", "footer_copyright_font_weight", "footer_copyright_font_style", "footer_copyright_color", "footer_copyright_alignment",
          ]
        )}
    </div>
  );
}