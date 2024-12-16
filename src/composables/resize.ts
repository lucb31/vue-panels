import { onUnmounted, Ref } from "vue"

type ResizeTarget = { width: string }

export const useResize = (panelContainer: Ref<HTMLElement | null>) => {
  let resizeTarget: ResizeTarget | null
  let dragStartX: number = 0
  let dragStartWidth: number = 0
  let dragElement: HTMLElement | null

  const handleMouseMove = (args: MouseEvent) => {
    if (!dragElement) {
      return
    }
    dragElement.style.width = calcNewPanelWidth(args.pageX - dragStartX)
  }

  const handleMouseUp = (args: MouseEvent) => {
    if (!resizeTarget) {
      console.error("Could not save width: No item found")
      return
    }
    // Persist new width
    resizeTarget.width = calcNewPanelWidth(args.pageX - dragStartX)

    // Reset
    resizeTarget = null
    dragStartX = 0
    dragStartWidth = 0
    dragElement = null
    removeEventListener('mouseup', handleMouseUp)
    removeEventListener('mousemove', handleMouseMove)
  }

  // Triggered by starting to drag the resize handle **after** the panel identified by panelId
  function startResizing(args: MouseEvent, item: ResizeTarget) {
    resizeTarget = item
    dragStartX = args.pageX
    dragElement = (args.target as EventTarget & { previousElementSibling: HTMLElement | null }).previousElementSibling
    if (!(dragElement instanceof HTMLElement)) {
      console.error("Could not start resize: No target element found")
      return
    }
    dragStartWidth = dragElement.offsetWidth
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleMouseMove)
    dragElement.style.width = calcNewPanelWidth(args.pageX - dragStartX)
  }


  // @param offsetX: Delta between dragStart and current mouse position
  // @returns: New calculated width in percent
  function calcNewPanelWidth(offsetX: number): string {
    if (!panelContainer.value) {
      console.error("Cannot resize: No parent container")
      return ""
    }
    const containerWidth = panelContainer.value.clientWidth
    const paneWidth = dragStartWidth + offsetX
    const resultWidthInPercent = paneWidth / containerWidth * 100

    return `${resultWidthInPercent}%`
  }

  onUnmounted(() => {
    removeEventListener('mouseup', handleMouseUp)
    removeEventListener('mousemove', handleMouseMove)
  })

  return { startResizing }
}
