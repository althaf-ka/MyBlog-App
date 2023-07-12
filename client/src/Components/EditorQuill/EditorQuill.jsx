import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function EditorQuill({ value, onChange }) {
  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
    "align",
  ];
  const modules = {
    toolbar: [
      [{ header: "1" }, { header: "2" }, { font: [] }],
      [{ size: [] }],
      [{ align: [] }],
      [("bold", "italic", "underline", "strike", "blockquote")],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image", "video", "clean"],
    ],
  };

  return (
    <>
      <ReactQuill
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
      />
    </>
  );
}

export default EditorQuill;
