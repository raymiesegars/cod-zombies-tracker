import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Feedback & Bug Reports',
  description:
    'Submit feedback or report a bug for CoD Zombies Tracker. Help us improve the site with your suggestions and issue reports.',
};

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
