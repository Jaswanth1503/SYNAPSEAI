import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { env } from '../config/env';

// Configure Cloudinary SDK
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadResult {
  videoUrl: string;
  publicId: string;
}

export class StorageService {
  /**
   * Upload video file buffer to Cloudinary (resource_type: 'video')
   */
  static async uploadVideo(
    fileBuffer: Buffer,
    folder: string = 'synapseai_videos'
  ): Promise<UploadResult> {
    const isCloudinaryConfigured =
      env.CLOUDINARY_CLOUD_NAME &&
      env.CLOUDINARY_CLOUD_NAME !== 'dummy_cloud_name' &&
      env.CLOUDINARY_API_KEY !== 'dummy_api_key';

    // If Cloudinary credentials are ready, perform stream upload
    if (isCloudinaryConfigured) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'video',
            folder,
            chunk_size: 6000000, // 6MB chunks for reliable video uploads
          },
          (error: any, result?: UploadApiResponse) => {
            if (error || !result) {
              return reject(new Error(`Cloudinary upload failed: ${error?.message || 'Unknown error'}`));
            }
            resolve({
              videoUrl: result.secure_url,
              publicId: result.public_id,
            });
          }
        );

        uploadStream.end(fileBuffer);
      });
    }

    // Development Fallback when Cloudinary API keys are not set:
    // Cycle between distinct public sample video URLs so local uploads are visibly unique in player
    console.warn('[StorageService] Cloudinary keys not configured. Using dynamic sample video URL generator for local dev.');
    const timestamp = Date.now();
    const mockPublicId = `mock_video_${timestamp}`;

    const sampleVideos = [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnTheGrid.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    ];
    const sampleIndex = timestamp % sampleVideos.length;
    const mockVideoUrl = sampleVideos[sampleIndex];

    return {
      videoUrl: mockVideoUrl,
      publicId: mockPublicId,
    };
  }
}
