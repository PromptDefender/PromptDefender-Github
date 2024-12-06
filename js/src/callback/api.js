const DEFENDER_URL = process.env.DEFENDER_URL;

export const retrieveScore = async (prompt) => {
  return await fetch(`${DEFENDER_URL}/score`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: prompt
    })
  })
  .then(res => res.json())
  .then(data => data.response);
};