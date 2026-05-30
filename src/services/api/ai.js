import axios from 'axios'

export async function generateReport(json, signal) {
  const prompt = `You are a field researcher. Write 500-word report on ${json.name}. Use data: ${JSON.stringify(json).slice(0,7000)}. Sections: 1.Geography 2.Climate 3.People 4.Economy 5.Infrastructure 6.History 7.Risks. Cite sources like [Open-Meteo]. No fluff.`
  try {
    const encodedPrompt = encodeURIComponent(prompt);
    const { data } = await axios.get(`https://text.pollinations.ai/${encodedPrompt}?model=openai`, { 
      signal, 
      timeout: 20000 
    })
    return data
  } catch (e) {
    if (e.name === 'AbortError') throw e
    return "AI report unavailable. Data shown in tabs."
  }
}
