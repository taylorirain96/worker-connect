import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Carpentry & Joinery',
  'Painting & Decorating',
  'Roofing',
  'Landscaping & Gardening',
  'Cleaning',
  'HVAC & Ventilation',
  'Concrete & Foundations',
  'Tiling & Flooring',
  'Fencing',
  'General Labourer',
  'Commercial Construction',
  'Renovation & Remodelling',
  'Other',
]

export async function categoriseJob(title: string, description: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a job categorisation assistant for a New Zealand trade platform. Given a job title and description, return ONLY the single most appropriate category from this list: ${CATEGORIES.join(', ')}. Return only the category name, nothing else.`,
        },
        {
          role: 'user',
          content: `Job title: ${title}\n\nDescription: ${description}`,
        },
      ],
      max_tokens: 20,
      temperature: 0,
    })
    const category = completion.choices[0]?.message?.content?.trim() ?? 'Other'
    return CATEGORIES.includes(category) ? category : 'Other'
  } catch {
    return 'Other'
  }
}
