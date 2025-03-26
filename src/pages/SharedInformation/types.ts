export interface Attachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
}

export interface SharedInfo {
  id: string;
  title: string;
  content: string;
  attachments: Attachment[];
  createdBy: string;
  createdAt: string;
}