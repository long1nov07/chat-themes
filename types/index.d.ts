export type SceneId = 'underwater' | 'pond' | 'night-sky' | 'fireflies'
export type Choice = SceneId | 'off'
export type Pose = 'chill' | 'sleep' | 'work'
export type FigureState = { now: Pose; from: Pose | null }

declare module 'claude-code' {
  interface PluginState {
    'chat-themes': {
      current: Choice
      isOpen: boolean
      pose: FigureState
    }
  }
}
