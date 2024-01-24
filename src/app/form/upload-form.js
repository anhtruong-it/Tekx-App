"use client";
import LoadingButton from "@/components/loading-button";
import { useState, useRef } from "react";

const UploadForm = () => {
  const inputFileRef = useRef(null);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [projectId, setProjectId] = useState("");

  const allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg'];

  const handleUpload = async (event) => {
    event.preventDefault();

    const file = inputFileRef.current.files[0];

    try {
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size should be less than 5MB.');
      }

      if (!allowedFileTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a PNG, JPG, JPEG, or SVG file.');
      }

    } catch (error) {
      alert(error.message);
      return;
    }

    try {
      setUploading(true);

      // Merge file data and project ID
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", projectId);

      // Upload an image
      await fetch(`/api/image-upload?filename=${file.name}`, {
        method: "POST",
        body: formData,
      });

      // Classify image
      const response = await fetch(
        `/api/image-classification?filename=${file.name}&projectId=${projectId}`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setImage(data);
      } else {
        console.error("Error in image classification:", response.statusText);
      }
    } catch (error) {
      console.error("Error during file upload/classification:", error.message);
      alert('An error occurred. Please try again.');
    } finally {
      setProjectId("");
      setUploading(false);
    }
  };

  return (
    <>
      { //Information image table
        image && (
          <div className="mt-4">
            <h2 className="text-2xl font-bold mb-2">Classified Image</h2>
            <table className="min-w-full border border-gray-300">
              <tbody>
                <tr>
                  <td className="border p-2">
                    <strong>URL:</strong>
                  </td>
                  <td className="border p-2">{image.url}</td>
                </tr>
                <tr>
                  <td className="border p-2">
                    <strong>Filename:</strong>
                  </td>
                  <td className="border p-2">{image.filename}</td>
                </tr>
                <tr>
                  <td className="border p-2">
                    <strong>Project ID:</strong>
                  </td>
                  <td className="border p-2">{image.projectId}</td>
                </tr>
                <tr>
                  <td className="border p-2">
                    <strong>Issue Type:</strong>
                  </td>
                  <td className="border p-2">{image.issue.issueType}</td>
                </tr>
                <tr>
                  <td className="border p-2">
                    <strong>Risk Rating:</strong>
                  </td>
                  <td className="border p-2">{image.issue.riskRating}</td>
                </tr>
                <tr>
                  <td className="border p-2">
                    <strong>Action:</strong>
                  </td>
                  <td className="border p-2">{image.issue.action}</td>
                </tr>
                <tr>
                  <td className="border p-2">
                    <strong>Rectification Price:</strong>
                  </td>
                  <td className="border p-2">{image.issue.rectificationPrice}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

      <h1>Mini Classification Image Project</h1>

      {
        // Upload form
        uploading ? (
          <LoadingButton variant="blue" text="Uploading..." />
        ) : (
          <form onSubmit={handleUpload}>
            <input
              name="projectId"
              type="number"
              placeholder="Enter Project ID"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
              className="border border-gray-300 rounded-md p-2 text-black"
            />

            <input
              name="file"
              ref={inputFileRef}
              type="file"
              accept="image/*"
              required
            />

            <button type="submit">Upload</button>
          </form>
        )
      }
    </>
  );
};

export default UploadForm;
