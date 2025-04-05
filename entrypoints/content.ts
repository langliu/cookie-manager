import { onMessage } from "~/lib/messaging";

export default defineContentScript({
  matches: ['*://*/*', '<all_urls>'],
  main(ctx) {
    console.log('Hello content.')
    onMessage('getStringLength', async (message) => {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
      if (!tab?.id) return 0
      const cookies = await browser.cookies.getAll({
        url: tab.url,
      })
      console.log('cookies', cookies)
      return message.data.length;
    });
  },
})
