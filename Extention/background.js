const DATABRICKS_URL = "https://dbc-e9371f7d-875d.cloud.databricks.com/serving-endpoints/video_ai_detector/invocations";

const DATABRICKS_TOKEN = chrome.storage.local.get(["db_token"], (result) => {
  return result.db_token;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "predict_batch") {
    fetch(DATABRICKS_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DATABRICKS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        dataframe_split: {
          data: message.frames
        }
      })
    })
      .then(res => res.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: err }));

    return true;
  }
});