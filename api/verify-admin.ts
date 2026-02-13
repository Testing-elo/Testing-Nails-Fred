import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false });
  }

  const { code } = req.body;

  if (code === process.env.ADMIN_CODE) {
    return res.status(200).json({ success: true });
  }

  return res.status(401).json({ success: false });
}
