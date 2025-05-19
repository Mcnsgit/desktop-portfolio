// src/utils/iconUtils.ts

// Helper to get a default icon based on item type and name (extension)
export const getDefaultIcon = (type: 'file' | 'folder' | string, name: string): string => {
  if (type === 'folder') {
    return '/assets/win98-icons/png/directory_closed-1.png'; // Default closed folder icon
  }
  // For files, try to determine by extension
  const extension = name.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'txt':
      return '/assets/win98-icons/png/file_lines-0.png'; // Text file icon
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      return '/assets/win98-icons/png/image_gallery-0.png'; // Image file icon
    // Add more cases for common file types as needed
    // e.g., pdf, doc, xls, etc.
    default:
      return '/assets/win98-icons/png/generic_file-0.png'; // Generic file icon
  }
}; 