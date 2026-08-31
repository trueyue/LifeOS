export default function handler(req: any, res: any) {
  res.status(200).json({
    status: 'ok',
    appName: 'LifeOS',
    timestamp: new Date().toISOString(),
  });
}