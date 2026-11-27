export type SceneId = 'underwater' | 'pond' | 'night-sky' | 'fireflies'
export type Choice = SceneId | 'off'

declare module 'claude-code' {
  interface PluginState {
    'chat-themes': {
      current: Choice
      isOpen: boolean
    }
  }
}
