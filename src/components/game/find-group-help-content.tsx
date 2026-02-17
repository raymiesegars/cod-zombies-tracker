'use client';

export function FindGroupHelpContent() {
  return (
    <div className="space-y-5 text-sm text-bunker-200">
      <section>
        <h3 className="text-base font-semibold text-white mb-2">What Find Group does</h3>
        <p className="mb-2">
          Post a listing when you want teammates for a main Easter egg or a run. Set the map, how many players you want, and how to reach you (Discord, Steam, etc.). Others can open your listing and use the built-in chat to coordinate.
        </p>
        <p>
          Listings expire after 30 days so the board doesn’t fill up with old posts. You can create a new one anytime.
        </p>
      </section>
      <section>
        <h3 className="text-base font-semibold text-white mb-2">Creating a listing</h3>
        <p className="mb-2">
          Click “Create listing,” pick a map and (optionally) a specific main quest Easter egg, then choose desired player count and add your contact info. Once it’s live, you’ll see messages in the listing’s chat and can bump or edit from the listing page.
        </p>
        <p>
          Only the creator can edit or delete the listing. Everyone can view and send messages as long as the listing exists.
        </p>
      </section>
    </div>
  );
}
