'use client';

/**
 * Temporary homepage switch for ZCS-3 Shattered Universe.
 * After the event: move zcs3-home to /events/zcs3 and restore OriginalHomePage here.
 */
import Zcs3HomePage from './_home/zcs3-home';
// import OriginalHomePage from './_home/original-home';

export default function HomePage() {
  return <Zcs3HomePage />;
  // return <OriginalHomePage />;
}
