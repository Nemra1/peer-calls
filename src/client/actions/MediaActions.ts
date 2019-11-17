import { makeAction, AsyncAction } from '../async'
import { MEDIA_AUDIO_CONSTRAINT_SET, MEDIA_VIDEO_CONSTRAINT_SET, MEDIA_ENUMERATE, MEDIA_STREAM, MEDIA_VISIBLE_SET } from '../constants'

export interface MediaDevice {
  id: string
  name: string
  type: 'audioinput' | 'videoinput'
}

export const enumerateDevices = makeAction(MEDIA_ENUMERATE, async () => {
  const devices = await navigator.mediaDevices.enumerateDevices()

  return devices
  .filter(
    device => device.kind === 'audioinput' || device.kind === 'videoinput')
  .map(device => ({
    id: device.deviceId,
    type: device.kind,
    name: device.label,
  }) as MediaDevice)

})

export type FacingMode = 'user' | 'environment'

export interface DeviceConstraint {
  deviceId: string
}

export interface FacingConstraint {
  facingMode: FacingMode | { exact: FacingMode }
}

export type VideoConstraint = DeviceConstraint | boolean | FacingConstraint
export type AudioConstraint = DeviceConstraint | boolean

export interface GetMediaConstraints {
  video: VideoConstraint
  audio: AudioConstraint
}

declare global {
  interface Navigator {
    webkitGetUserMedia?: typeof navigator.getUserMedia
    mozGetUserMedia?: typeof navigator.getUserMedia
  }
}

async function getUserMedia(
  constraints: MediaStreamConstraints,
): Promise<MediaStream> {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    return navigator.mediaDevices.getUserMedia(constraints)
  }

  const _getUserMedia: typeof navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia

  return new Promise<MediaStream>((resolve, reject) => {
    _getUserMedia.call(navigator, constraints, resolve, reject)
  })
}

export interface MediaVideoConstraintAction {
  type: 'MEDIA_VIDEO_CONSTRAINT_SET'
  payload: VideoConstraint
}

export interface MediaAudioConstraintAction {
  type: 'MEDIA_AUDIO_CONSTRAINT_SET'
  payload: AudioConstraint
}

export function setVideoConstraint(
  payload: VideoConstraint,
): MediaVideoConstraintAction {
  return {
    type: MEDIA_VIDEO_CONSTRAINT_SET,
    payload,
  }
}

export function setAudioConstraint(
  payload: AudioConstraint,
): MediaAudioConstraintAction {
  return {
    type: MEDIA_AUDIO_CONSTRAINT_SET,
    payload,
  }
}

export interface MediaVisibleAction {
  type: 'MEDIA_VISIBLE_SET'
  payload: { visible: boolean }
}

export function setMediaVisible(visible: boolean): MediaVisibleAction {
  return {
    type: MEDIA_VISIBLE_SET,
    payload: { visible },
  }
}

export const getMediaStream = makeAction(
  MEDIA_STREAM,
  async (constraints: GetMediaConstraints) => getUserMedia(constraints),
)

export type MediaEnumerateAction = AsyncAction<'MEDIA_ENUMERATE', MediaDevice[]>
export type MediaStreamAction = AsyncAction<'MEDIA_STREAM', MediaStream>

export type MediaAction =
  MediaVideoConstraintAction |
  MediaAudioConstraintAction |
  MediaEnumerateAction |
  MediaStreamAction |
  MediaVisibleAction
