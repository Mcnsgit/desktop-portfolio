import React from 'react';
import { DesktopFile } from '@/types/fs';
import Icon from '@/components/desktop/Icon';
import styles from '@/components/styles/FolderWindow.module.scss';

interface FolderWindowProps {
  files: DesktopFile[];
  onOpenFile: (file: DesktopFile) => void;
}

const FolderWindow: React.FC<FolderWindowProps> = ({ files, onOpenFile }) => {
  return (
    <div className={styles.folderWindow}>
      <div className={styles.folderContent}>
        {files.map(file => (
          <Icon
            onPositionChange={() => {}}
            x={file.x}
            y={file.y}
            key={file.id}
            id={file.id}
            text={file.name}
            iconSrc={file.icon}
            onDoubleClick={() => onOpenFile(file)}
          />
        ))}
      </div>
    </div>
  );
};

export default FolderWindow; 