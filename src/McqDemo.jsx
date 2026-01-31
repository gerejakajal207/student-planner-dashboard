export default function McqDemo() {
  const callGemini = async () => {
    try {
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: "Create 10 mcqs on the topic data structures If the topic is valid for mcqs give mcqs otherwise return -1. The topic provided should not be a name or something like abc xyz.If the super set of topic can not be interpreted give the question to choose the main topic under which it lies.For example focus can be psychological or physics optical.The mcqs should be in the format of all the questions and then the answers",
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!res.ok) {
        const errorDetails = await res.json();
        console.error("API Error:", errorDetails);
        return;
      }

      const data = await res.json();
      console.log("Gemini Response:", data.candidates?.[0]?.content?.parts?.[0]?.text);
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  return <button onClick={callGemini}>Ask Gemini</button>;
}
