import React from "react";

export default function ClinicContactSection({
  fieldRow,
  websiteContent,
  websiteContentForm,
  websiteContentEditing,
  contentEditActions,
}) {
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "18px 20px",
    width: "100%",
    marginBottom: 20,
  };

  const sectionTitle = {
    fontSize: 20,
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 18px",
    fontFamily: "Arial, sans-serif",
  };

  const sectionFields = {
    footer_brand_name:
      websiteContentForm.footer_brand_name ??
      websiteContent.footer_brand_name,

    footer_team_name:
      websiteContentForm.footer_team_name ??
      websiteContent.footer_team_name,

    footer_system_name:
      websiteContentForm.footer_system_name ??
      websiteContent.footer_system_name,

    contact_phone1:
      websiteContentForm.contact_phone1 ??
      websiteContent.contact_phone1,

    contact_phone2:
      websiteContentForm.contact_phone2 ??
      websiteContent.contact_phone2,

    contact_email:
      websiteContentForm.contact_email ??
      websiteContent.contact_email,

    contact_facebook_name:
      websiteContentForm.contact_facebook_name ??
      websiteContent.contact_facebook_name,

    contact_facebook_url:
      websiteContentForm.contact_facebook_url ??
      websiteContent.contact_facebook_url,

    contact_badge:
      websiteContentForm.contact_badge ??
      websiteContent.contact_badge,

    contact_heading:
      websiteContentForm.contact_heading ??
      websiteContent.contact_heading,

    contact_button:
      websiteContentForm.contact_button ??
      websiteContent.contact_button,

    hours_weekdays:
      websiteContentForm.hours_weekdays ??
      websiteContent.hours_weekdays,

    hours_weekday_time:
      websiteContentForm.hours_weekday_time ??
      websiteContent.hours_weekday_time,

    hours_sunday:
      websiteContentForm.hours_sunday ??
      websiteContent.hours_sunday,

    hours_sunday_note:
      websiteContentForm.hours_sunday_note ??
      websiteContent.hours_sunday_note,
  };

  return (
    <div>

      <h3 style={sectionTitle}>Clinic Contact</h3>

      <div style={gridStyle}>
        {fieldRow("Phone Number 1", "contact_phone1", "tel")}
        {fieldRow("Phone Number 2", "contact_phone2", "tel")}

        {fieldRow("Email Address", "contact_email")}
        {fieldRow("Facebook Page Name", "contact_facebook_name")}

        {fieldRow("Facebook Page URL", "contact_facebook_url")}
        {fieldRow("Contact Badge", "contact_badge")}

        {fieldRow("Contact Heading", "contact_heading")}
        {fieldRow("Contact Button Label", "contact_button")}
      </div>

      <hr style={{ margin: "28px 0" }} />

      <h3 style={sectionTitle}>Clinic Details</h3>

      <div style={gridStyle}>
        {fieldRow(
          "Weekdays Label (e.g. Monday to Saturday)",
          "hours_weekdays"
        )}

        {fieldRow(
          "Weekday Hours (e.g. 10:00 AM - 7:00 PM)",
          "hours_weekday_time"
        )}

        {fieldRow(
          "Sunday Label (e.g. Sunday)",
          "hours_sunday"
        )}

        {fieldRow(
          "Sunday Hours Note (e.g. By Appointment)",
          "hours_sunday_note"
        )}
      </div>

      <hr style={{ margin: "28px 0" }} />

      <h3 style={sectionTitle}>Footer</h3>

      <div style={gridStyle}>
        {fieldRow("Brand Name", "footer_brand_name")}
        {fieldRow("Team Name", "footer_team_name")}
        {fieldRow("System Name", "footer_system_name")}
      </div>

      {websiteContentEditing &&
        contentEditActions(sectionFields, [
          "footer_brand_name",
          "footer_team_name",
          "footer_system_name",
          "contact_phone1",
          "contact_email",
        ])}
    </div>
  );
}