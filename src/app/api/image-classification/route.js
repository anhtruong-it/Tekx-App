import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';
import axios from 'axios';
import issueMockData from '/issue-mock-data.json';

// Get a random issue
const getRandomIssue = () => {
  const randomIndex = Math.floor(Math.random() * issueMockData.issues.length);
  return issueMockData.issues[randomIndex];
};

// Update blob with issue information
const updateBlobWithIssue = (blob, projectId, issueType) => {
  const randomIssue = getRandomIssue();
  const { pathname, size, uploadedAt, ...updatedBlob } = blob;
  updatedBlob.filename = blob.pathname;
  updatedBlob.projectId = projectId;
  updatedBlob.issue = {
    issueType,
    riskRating: randomIssue.riskRating,
    action: randomIssue.action,
    rectificationPrice: randomIssue.rectificationPrice,
  };
  return updatedBlob;
};

// Get issue type using ML
const getIssueTypeFromML = async (imageUrl) => {
  const apiMLIssueType = `https://alt-text-generator.vercel.app/api/generate?imageUrl=${imageUrl}`;
  const response = await axios.get(apiMLIssueType);
  return response.data.replace("Caption: ");
};

export const POST = async (request) => {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');
  const projectId = searchParams.get('projectId');

  try {
    // Find an existing image in Vercel Blob
    const blobs = await list();
    const matchingBlob = blobs.blobs.find((blob) => blob.pathname == filename);

    if (!matchingBlob) {
      return NextResponse.error('Blob not found', { status: 404 });
    }

    // ML to recognize an image by text
    const issueType = await getIssueTypeFromML(matchingBlob.url);

    // Update blob with issue information
    const updatedBlob = updateBlobWithIssue(matchingBlob, projectId, issueType);

    return NextResponse.json(updatedBlob);
  } catch (error) {
    console.error('Error processing request: ', error);
    return NextResponse.error('Internal Server Error', { status: 500 });
  }
};
