export type SceneId = 'underwater' | 'night-sky' | 'fireflies'
export type Choice = SceneId | 'off'

declare module 'claude-code' {
  interface PluginState {
    'chat-themes': {
      current: Choice
      note: string | null
    }
  }
}
