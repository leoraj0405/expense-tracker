'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Modal, Button, Group, Text, Stack } from '@mantine/core';
import {
  IconCamera,
  IconUpload,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';

interface ProfilePhotoUploadProps {
  previewSrc: string;
  file: File | null;
  onChange: (file: File | null) => void;
  userName?: string;
}

function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], filename, { type: mime });
}

export function ProfilePhotoUpload({
  previewSrc,
  file,
  onChange,
  userName,
}: ProfilePhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setIsStartingCamera(true);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera is not supported on this device.');
      }

      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setCameraError('Unable to access camera. Check permissions or use upload instead.');
    } finally {
      setIsStartingCamera(false);
    }
  }, [stopCamera]);

  useEffect(() => {
    if (cameraOpen) {
      startCamera();
    } else {
      stopCamera();
      setCameraError(null);
    }

    return () => stopCamera();
  }, [cameraOpen, startCamera, stopCamera]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    if (selected && selected.type.startsWith('image/')) {
      onChange(selected);
    }
    event.target.value = '';
  };

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    onChange(dataUrlToFile(dataUrl, `profile-${Date.now()}.jpg`));
    setCameraOpen(false);
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div className="et-profile-photo">
      <div className="et-profile-photo-preview">
        {previewSrc ? (
          <img src={previewSrc} alt={userName || 'Profile'} />
        ) : (
          <div className="et-profile-photo-placeholder">
            <IconUser size={40} stroke={1.5} />
          </div>
        )}
        {file && <span className="et-profile-photo-badge">New photo</span>}
      </div>

      <div className="et-profile-photo-actions">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="et-profile-photo-input"
          onChange={handleFileSelect}
          aria-hidden
          tabIndex={-1}
        />

        <Button
          type="button"
          variant="default"
          className="et-btn et-btn-ghost et-profile-photo-btn"
          leftSection={<IconUpload size={16} />}
          onClick={() => fileInputRef.current?.click()}
        >
          Upload photo
        </Button>

        <Button
          type="button"
          variant="default"
          className="et-btn et-btn-ghost et-profile-photo-btn"
          leftSection={<IconCamera size={16} />}
          onClick={() => setCameraOpen(true)}
        >
          Take photo
        </Button>

        {file && (
          <Button
            type="button"
            variant="subtle"
            color="red"
            className="et-profile-photo-btn"
            leftSection={<IconTrash size={16} />}
            onClick={handleRemove}
          >
            Remove
          </Button>
        )}
      </div>

      <Text size="xs" c="dimmed" mt={6}>
        JPG or PNG. Use take photo on mobile or webcam on desktop.
      </Text>

      <Modal
        opened={cameraOpen}
        onClose={() => setCameraOpen(false)}
        title="Take profile photo"
        centered
        size="md"
        radius="md"
      >
        <Stack gap="md">
          <div className="et-profile-camera-wrap">
            {cameraError ? (
              <Text size="sm" c="red" ta="center" py="xl">
                {cameraError}
              </Text>
            ) : (
              <video
                ref={videoRef}
                className="et-profile-camera-video"
                playsInline
                muted
                aria-label="Camera preview"
              />
            )}
            {isStartingCamera && !cameraError && (
              <Text size="sm" c="dimmed" ta="center">
                Starting camera…
              </Text>
            )}
          </div>

          <Group justify="flex-end" gap="xs">
            <Button variant="subtle" onClick={() => setCameraOpen(false)}>
              Cancel
            </Button>
            {!cameraError && (
              <Button color="navy" onClick={handleCapture} disabled={isStartingCamera}>
                Capture
              </Button>
            )}
            {cameraError && (
              <Button onClick={() => fileInputRef.current?.click()}>Upload instead</Button>
            )}
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}
