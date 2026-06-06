import type { ComponentType } from "react";

function GooglePlay12TestersGuide() {
  return (
    <>
      <p>
        If you opened a new Google Play personal developer account after November 13, 2023,
        you can&apos;t publish a single app to production until you&apos;ve run a{" "}
        <strong>closed testing track with at least 12 active testers, continuously,
        for 14 days</strong>. No shortcut. No grandfather clause. No appeal.
      </p>
      <p>
        This guide covers exactly what Google requires, the failure modes that catch most
        indie devs by surprise, and the fastest legitimate ways to find those 12 testers.
      </p>
      <h2>What Google actually requires</h2>
      <ul>
        <li><strong>12 testers</strong> opted in to a closed test track of your app.</li>
        <li><strong>14 continuous days</strong> with all 12 opted in — the timer resets if you drop below 12.</li>
        <li>Testers must use <strong>real Google accounts</strong>. Burner accounts flagged by Google can disqualify the cohort.</li>
        <li>Applies only to <strong>personal accounts</strong> created on or after 2023-11-13. Organization accounts are exempt.</li>
      </ul>
      <h2>What counts as &ldquo;active&rdquo;</h2>
      <p>
        Google doesn&apos;t publish a strict definition. The consistent signal from Play
        Console support is: a tester has accepted the testing invitation, installed the
        app, and the device has reported back to Play at least once during the 14-day
        window. Closing the app without opening it doesn&apos;t count. Uninstalling
        resets the tester.
      </p>
      <h2>The four ways developers fail</h2>
      <ol>
        <li><strong>Inactive testers.</strong> They accept the invite but never open the app.</li>
        <li><strong>Dropped testers.</strong> Someone uninstalls on day 10. Counter resets.</li>
        <li><strong>Fiverr accounts.</strong> Many are flagged by Google. Cohort disqualified.</li>
        <li><strong>Friend fatigue.</strong> Works app one. By app three, nobody answers.</li>
      </ol>
      <h2>A 14-day playbook</h2>
      <ol>
        <li>Day &minus;1: set up the closed track in Play Console.</li>
        <li>Day 0: recruit <strong>15 testers</strong> (above 12 for safety). Brief them in writing.</li>
        <li>Day 3: check Play Console tester report. Confirm 12+ active.</li>
        <li>Day 7: nudge anyone who hasn&apos;t opened the app yet.</li>
        <li>Day 10: recheck. If below 12, recruit fast.</li>
        <li>Day 14: production access unlocks.</li>
      </ol>
      <p>
        The 12-tester rule is annoying but not hard if you stack the deck early: recruit
        15 instead of 12, brief them clearly, and check the tester report twice during
        the window. Indie-dev <a href="/">mutual testing</a> is the cheapest and most
        reliable source — that&apos;s exactly why we built AppTest.
      </p>
    </>
  );
}

function Find12Testers24Hours() {
  return (
    <>
      <p>
        When your app is ready and the 14-day clock should already be ticking, getting
        12 testers <em>tomorrow</em> matters more than getting the perfect testers next
        month. Here are the fastest legitimate channels in 2026.
      </p>
      <h2>Same-day options</h2>
      <ul>
        <li><strong><a href="/">AppTest</a></strong> — post a request, indie devs enroll within hours because they need testers too.</li>
        <li><strong>r/TestersCommunity</strong> on Reddit — pinned swap threads, no karma gate.</li>
        <li><strong>Indie Hackers Telegram and Discord</strong> — search &ldquo;testers&rdquo; in the past week.</li>
      </ul>
      <h2>24-hour options</h2>
      <ul>
        <li><strong>r/AndroidDev</strong> — weekly self-promo thread accepts tester requests.</li>
        <li><strong>X / Twitter</strong> — post with #IndieDev #AndroidDev hashtags and tag a few large accounts.</li>
        <li><strong>Personal network</strong> — a focused WhatsApp / iMessage blast to 30 people usually returns 8–10 yeses.</li>
      </ul>
      <h2>What to send testers</h2>
      <p>
        A short message that includes (a) the opt-in URL from Play Console, (b) a one
        sentence pitch, and (c) the explicit ask: &ldquo;install once, keep it for 14
        days, no need to use daily.&rdquo; Most failures are tester confusion, not lack
        of goodwill.
      </p>
      <p>
        Aim for 15 testers, not 12. Buffer survives drops on day 9 without restarting
        the clock.
      </p>
    </>
  );
}

function WhatCountsAsActiveTester() {
  return (
    <>
      <p>
        Google&apos;s docs never spell it out. Here&apos;s the working definition
        Play Console support staff and experienced devs converge on.
      </p>
      <h2>The three conditions</h2>
      <ol>
        <li>The tester has accepted the opt-in URL with their Google account.</li>
        <li>They&apos;ve installed your app from the testing track.</li>
        <li>The device has phoned home to Google Play at least once within the 14-day window.</li>
      </ol>
      <p>
        Condition three is the silent killer. Installing the app via download doesn&apos;t
        guarantee a phone-home; the user has to <em>open</em> it (or have Play&apos;s
        background services check in) for the install to be reported.
      </p>
      <h2>What doesn&apos;t count</h2>
      <ul>
        <li>Accepted the invite but never installed.</li>
        <li>Installed via APK sideload (not through Play).</li>
        <li>Uninstalled at any point in the window.</li>
        <li>Same Google account opted in multiple times — counts once.</li>
      </ul>
      <h2>How to verify</h2>
      <p>
        Play Console &rarr; Testing &rarr; Closed testing &rarr; pick your track
        &rarr; Manage testers &rarr; Tester report. Updates roughly daily. If a
        tester says they installed but doesn&apos;t show up after 48 hours, ask them
        to <em>open the app once</em> with Wi-Fi on.
      </p>
    </>
  );
}

function NotEnoughTestersAfter14Days() {
  return (
    <>
      <p>
        You had 12 testers. It&apos;s been 14 days. Play Console still says
        you&apos;re not eligible. Five reasons, ranked by how often we see them.
      </p>
      <h2>1. Some testers never opened the app</h2>
      <p>
        Accepting the invite isn&apos;t enough — they need to install <em>and</em>
        the device has to report back. Confirm in the tester report.
      </p>
      <h2>2. A tester uninstalled mid-window</h2>
      <p>
        Uninstalling drops you below 12 retroactively from that day. The 14-day clock
        effectively restarts when you re-add a tester.
      </p>
      <h2>3. Testers opted in to the wrong track</h2>
      <p>
        Internal testing doesn&apos;t count. Open testing doesn&apos;t count. Only
        the <em>closed</em> track does. Check which URL you shared.
      </p>
      <h2>4. The 14 days haven&apos;t fully elapsed in Google&apos;s clock</h2>
      <p>
        Google measures from when the 12th tester became active, not from when you
        created the track. The display can lag the actual eligibility by 24 hours.
      </p>
      <h2>5. Account verification still pending</h2>
      <p>
        ID and address verification block production access independently. Check
        Account Details for an unresolved item.
      </p>
    </>
  );
}

function ClosedVsInternalVsOpen() {
  return (
    <>
      <p>
        Google Play has three testing tracks. They look similar in the console but
        behave differently — and only one counts toward the 12-tester rule.
      </p>
      <h2>Internal testing</h2>
      <ul>
        <li>Up to 100 testers, added by email.</li>
        <li>No review. Fast publish.</li>
        <li>Good for: your dev team, build verification.</li>
        <li><strong>Does not count toward 12-tester rule.</strong></li>
      </ul>
      <h2>Closed testing</h2>
      <ul>
        <li>Up to thousands of testers via Google Group, email list, or opt-in URL.</li>
        <li>Subject to Google review (usually a few hours, sometimes days).</li>
        <li>Good for: pre-launch tester cohorts, the 12-tester gate.</li>
        <li><strong>This is the one that counts.</strong></li>
      </ul>
      <h2>Open testing</h2>
      <ul>
        <li>Anyone with the public testing URL can join.</li>
        <li>Listed on Play Store under &ldquo;Join the beta&rdquo;.</li>
        <li>Good for: scaling once you&apos;ve already cleared the 12-tester gate.</li>
        <li><strong>Doesn&apos;t count toward 12-tester rule</strong> (open isn&apos;t closed).</li>
      </ul>
      <p>
        If you&apos;re new and trying to ship, set up <em>closed</em> testing first.
        Internal and open are for after you&apos;re in production.
      </p>
    </>
  );
}

function OwnGoogleAccountsAsTesters() {
  return (
    <>
      <p>
        It&apos;s the first idea every indie dev has: stack 12 of your own Gmail
        addresses, opt them all in, wait 14 days, done. It almost never works.
      </p>
      <h2>What Google&apos;s anti-abuse system catches</h2>
      <ul>
        <li><strong>Shared device fingerprints.</strong> 12 accounts on one Pixel = one tester.</li>
        <li><strong>Shared IP.</strong> All accounts checking in from your home Wi-Fi raises a flag.</li>
        <li><strong>Account age clustering.</strong> 12 newly created Gmails with no activity history is suspicious.</li>
        <li><strong>Behavioural signals.</strong> Identical install timings, identical opt-in patterns.</li>
      </ul>
      <p>
        You may pass the 14 days, then have production access denied with a generic
        &ldquo;requirements not met&rdquo; message — and no path to appeal because
        Google rarely explains anti-abuse decisions.
      </p>
      <h2>What works instead</h2>
      <p>
        Recruit 12 distinct humans on distinct devices on distinct networks. The
        easiest legitimate path is a <a href="/">mutual-testing community</a> where
        the testers are themselves developers facing the same gate.
      </p>
    </>
  );
}

function GooglePlay20To12RuleChange() {
  return (
    <>
      <p>
        When Google first introduced the closed-testing gate in late 2023, the bar
        was 20 testers for 14 days. In mid-2024 they dropped it to 12. Here&apos;s
        what changed and who it helps.
      </p>
      <h2>What the 20-tester rule looked like</h2>
      <p>
        Originally: 20 active testers, 14 continuous days. Most indie devs could
        round up 10 friends, then stalled at 11–15. The community pushback was loud,
        and Google quietly walked the requirement back.
      </p>
      <h2>What changed in 2024</h2>
      <ul>
        <li>Tester count: 20 &rarr; 12.</li>
        <li>14-day window: unchanged.</li>
        <li>&ldquo;Active&rdquo; definition: unchanged.</li>
        <li>Personal-only scope: unchanged.</li>
      </ul>
      <h2>What didn&apos;t change</h2>
      <p>
        The mechanism is identical. You still need real Google accounts, real
        installs, and a continuous 14-day window. If you fail the 12-tester rule
        today, you would have failed the 20-tester rule with even less margin.
      </p>
      <p>
        Net effect: indie devs with small networks now have a fighting chance, but
        the failure modes haven&apos;t shifted.
      </p>
    </>
  );
}

function PersonalVsOrganizationAccount() {
  return (
    <>
      <p>
        Google Play distinguishes personal and organization developer accounts.
        Only one type faces the 12-tester gate — and the difference is enforced at
        signup, not chosen later.
      </p>
      <h2>Personal accounts</h2>
      <ul>
        <li>$25 one-time fee.</li>
        <li>Government ID + address verification.</li>
        <li><strong>Subject to the 12-tester / 14-day rule</strong> if created after 2023-11-13.</li>
        <li>Public &ldquo;developer name&rdquo; defaults to your legal name.</li>
      </ul>
      <h2>Organization accounts</h2>
      <ul>
        <li>$25 one-time fee.</li>
        <li>D-U-N-S number, organization documents.</li>
        <li><strong>Exempt from the 12-tester rule.</strong></li>
        <li>Public developer name is the org&apos;s legal name.</li>
      </ul>
      <h2>Is it worth converting?</h2>
      <p>
        You can&apos;t convert a personal account to organization after the fact.
        You can register a new organization account, but it&apos;s a separate
        account with its own apps. If you&apos;re shipping your first app, get a
        D-U-N-S number (free for individuals via Dun &amp; Bradstreet) and start
        organization from day one if you have one app in the pipeline.
      </p>
    </>
  );
}

function DoesInternalTestingCount() {
  return (
    <>
      <p>
        Short answer: no. Internal testing exists for your dev team — it doesn&apos;t
        count toward the 14-day requirement no matter how many testers you add.
      </p>
      <h2>Why internal doesn&apos;t count</h2>
      <p>
        Internal testing skips Google review and is capped at 100 testers added by
        email. It&apos;s designed for fast build verification, not for proving your
        app is ready for the public. Google explicitly carved this track out of the
        closed-testing requirement.
      </p>
      <h2>What to do if you&apos;ve been on the wrong track</h2>
      <ol>
        <li>Create a closed testing track in Play Console.</li>
        <li>Upload your latest bundle to it.</li>
        <li>Move your testers to the closed track via email list or opt-in URL.</li>
        <li>The 14-day clock starts when your 12th tester becomes active in the closed track. Internal-track time doesn&apos;t carry over.</li>
      </ol>
      <h2>When internal is still useful</h2>
      <p>
        Run internal testing in parallel with closed testing. Use it for rapid
        iteration with your immediate team while the closed cohort runs the
        14-day clock on a more stable build.
      </p>
    </>
  );
}

function TesterUninstallsDuring14Days() {
  return (
    <>
      <p>
        Day 10 of 14. A tester uninstalls. Does the clock reset? The honest answer
        is: it depends.
      </p>
      <h2>If you had exactly 12 testers</h2>
      <p>
        Dropping to 11 breaks the &ldquo;12 active for 14 continuous days&rdquo;
        condition. The 14-day window restarts from the day you regain 12 active
        testers. In practice, you&apos;re looking at adding 1+ testers and waiting
        a fresh 14 days.
      </p>
      <h2>If you had 15</h2>
      <p>
        You drop to 14. Still above 12. The clock keeps running. No impact.
      </p>
      <h2>The takeaway</h2>
      <ul>
        <li>Always recruit 15+ testers, not 12.</li>
        <li>Check the tester report on day 3 and day 10.</li>
        <li>If you drop below 12, recruit immediately — the clock resets only after the next 12-active day, not when you notice.</li>
      </ul>
      <p>
        Buffer is the difference between shipping on day 14 and shipping on day 28.
      </p>
    </>
  );
}

function SetupClosedTestingStepByStep() {
  return (
    <>
      <p>
        A click-by-click walkthrough for setting up your first Google Play closed
        testing track. Assumes you already have a verified Play Console account and
        a signed AAB.
      </p>
      <h2>1. Create the app shell</h2>
      <p>
        Play Console &rarr; Create app &rarr; pick name, language, free/paid,
        declarations. You don&apos;t need every detail filled in to start a closed
        track.
      </p>
      <h2>2. Open the closed testing track</h2>
      <p>
        Left nav &rarr; Testing &rarr; Closed testing &rarr; Create track. Name
        it something obvious like &ldquo;alpha&rdquo;. Default settings are fine.
      </p>
      <h2>3. Upload your bundle</h2>
      <p>
        Track page &rarr; Releases &rarr; Create new release &rarr; upload AAB.
        Add release notes (testers see these). Save &rarr; Review release.
      </p>
      <h2>4. Add testers</h2>
      <p>
        Easiest option: <em>Email list</em>. Paste a comma-separated list of Google
        emails. Alternative: <em>Google Group</em> if you want self-service join,
        or <em>opt-in URL</em> for sharing publicly.
      </p>
      <h2>5. Get the testing URL</h2>
      <p>
        Manage testers &rarr; copy the opt-in URL. Share with your testers. They
        click, accept, install via Play.
      </p>
      <h2>6. Submit for review</h2>
      <p>
        Roll out to closed testing. Google reviews the first release on any new
        track. Usually a few hours, occasionally up to 3 days. Until review
        completes, testers see &ldquo;not available&rdquo;.
      </p>
    </>
  );
}

function TesterBriefingEmailTemplate() {
  return (
    <>
      <p>
        Most tester recruitment fails because the ask is unclear. Below is a short,
        copy-paste-ready briefing that has worked across several indie launches.
      </p>
      <h2>The template</h2>
      <blockquote>
        <p>
          Hi [Name],
        </p>
        <p>
          I&apos;m launching [App Name] on Google Play and need 12 testers for 14
          days to satisfy Google&apos;s new closed-testing requirement. Would you
          help?
        </p>
        <p>
          <strong>What it takes from you:</strong>
        </p>
        <ul>
          <li>Click this link on your Android phone: [opt-in URL]</li>
          <li>Tap &ldquo;Become a tester&rdquo;.</li>
          <li>Install the app from Play Store (you&apos;ll see &ldquo;You&apos;re a tester&rdquo;).</li>
          <li>Open it once. Leave it installed for 14 days. You don&apos;t need to use it daily.</li>
        </ul>
        <p>
          That&apos;s it. I&apos;ll send a single check-in on day 7. Happy to test
          your app in return whenever you need.
        </p>
        <p>Thanks!</p>
      </blockquote>
      <h2>Why it works</h2>
      <ul>
        <li>Explains the &ldquo;why&rdquo; in one sentence (Google&apos;s rule, not your whim).</li>
        <li>Three numbered actions, no jargon.</li>
        <li>Sets expectation: one check-in, not daily nagging.</li>
        <li>Offers reciprocity — they&apos;ll need testers too.</li>
      </ul>
    </>
  );
}

function FindTestersTargetCountry() {
  return (
    <>
      <p>
        Sometimes your app needs testers from a specific country — GDPR-region
        feedback, INR pricing flow, Tamil keyboard input. The generic Reddit
        threads won&apos;t deliver. Here&apos;s where to look.
      </p>
      <h2>By region</h2>
      <ul>
        <li><strong>India</strong> — r/AndroidDevIndia, Telegram &ldquo;Indian Indie Devs&rdquo;, AppTest filtered by India.</li>
        <li><strong>EU</strong> — r/AndroidDev, ProductHunt &ldquo;Help Wanted&rdquo;, Mastodon #IndieDev tag.</li>
        <li><strong>SEA</strong> — Facebook groups &ldquo;Vietnam Android Developers&rdquo;, &ldquo;PH Indie Devs&rdquo;.</li>
        <li><strong>LATAM</strong> — Discord &ldquo;LatAm Android&rdquo;, Twitter accounts of regional Android Google Developer Groups.</li>
      </ul>
      <h2>By language</h2>
      <p>
        Country and language aren&apos;t the same thing. If you need French
        keyboard input, a Belgian or Canadian tester works as well as a French one.
        Phrase your ask by language when possible.
      </p>
      <h2>On AppTest</h2>
      <p>
        The location field on every <a href="/">request tile</a> is filterable.
        Set it to &ldquo;India&rdquo; or &ldquo;EU&rdquo; or any other region when
        posting, and testers self-select. Specificity tends to attract the right
        people instead of fewer people.
      </p>
    </>
  );
}

function FindTestersOnReddit() {
  return (
    <>
      <p>
        Reddit can deliver 12 testers in a day if you play by the unwritten rules.
        Break them and you&apos;ll get banned before anyone clicks your link.
      </p>
      <h2>Subreddits that allow tester requests</h2>
      <ul>
        <li><strong>r/TestersCommunity</strong> — explicitly built for this, no karma gate.</li>
        <li><strong>r/AndroidDev</strong> — weekly self-promo thread (read the sidebar for the day).</li>
        <li><strong>r/SideProject</strong> — accepts launches and beta requests.</li>
        <li><strong>r/IndieDev</strong> — mostly games but Android welcome.</li>
      </ul>
      <h2>What not to do</h2>
      <ul>
        <li>Don&apos;t post the same message in 8 subreddits in an hour. Anti-spam will catch you.</li>
        <li>Don&apos;t DM users who comment. It&apos;s reportable in most subs.</li>
        <li>Don&apos;t hide that you need testers for the 12-tester gate. Be straightforward.</li>
      </ul>
      <h2>A post that converts</h2>
      <p>
        Title: <em>&ldquo;[App Name] — Need 12 Google Play testers for closed
        testing (mutual welcome).&rdquo;</em> Body: one sentence on what the app
        does, the opt-in URL, an offer to test theirs in return. Reciprocity gets
        upvotes.
      </p>
    </>
  );
}

function FindTestersOnDiscord() {
  return (
    <>
      <p>
        A handful of indie Android Discord servers run weekly tester-swap channels.
        Worth joining if Reddit isn&apos;t delivering.
      </p>
      <h2>Active servers</h2>
      <ul>
        <li><strong>The Android Developers Discord</strong> — large, active, has a #beta-testers channel.</li>
        <li><strong>Kotlin Lang</strong> — surprisingly active swap threads in #showcase.</li>
        <li><strong>Indie Hackers Discord</strong> — multi-platform but Android section has weekly tester help threads.</li>
        <li><strong>r/AndroidDev linked Discord</strong> — accessible via the subreddit sidebar.</li>
      </ul>
      <h2>Etiquette</h2>
      <ul>
        <li>Lurk for 24 hours before posting. Each server has its own rhythm.</li>
        <li>Use the dedicated channel — not #general.</li>
        <li>Engage with others&apos; requests before posting yours. Reciprocity is currency.</li>
      </ul>
      <h2>Why Discord beats Reddit for speed</h2>
      <p>
        Discord conversations happen in real time. You&apos;ll often see someone
        opt in within minutes of posting, and you can answer setup questions
        instantly. Reddit takes hours.
      </p>
    </>
  );
}

function MonitorActiveTesterCount() {
  return (
    <>
      <p>
        Knowing exactly where your tester count stands is the difference between
        catching a drop on day 10 and discovering it on day 14.
      </p>
      <h2>Where to look</h2>
      <p>
        Play Console &rarr; Testing &rarr; Closed testing &rarr; pick your track
        &rarr; Manage testers &rarr; Tester report.
      </p>
      <h2>What you&apos;ll see</h2>
      <ul>
        <li>Number of opted-in testers.</li>
        <li>Number of <em>active</em> testers (the one that counts).</li>
        <li>Per-tester install status and last-active timestamp.</li>
      </ul>
      <h2>How often it updates</h2>
      <p>
        Roughly every 24 hours. Tester actions taken in the last few hours may not
        show yet. Don&apos;t panic if a tester says they installed an hour ago and
        the report is stale.
      </p>
      <h2>The schedule that catches everything</h2>
      <ul>
        <li><strong>Day 3:</strong> all opted-in testers should be active or chased.</li>
        <li><strong>Day 7:</strong> nudge anyone still inactive.</li>
        <li><strong>Day 10:</strong> last realistic chance to add more.</li>
        <li><strong>Day 14:</strong> confirm before submitting for production.</li>
      </ul>
    </>
  );
}

function InviteTestersClosedTesting() {
  return (
    <>
      <p>
        Play Console offers three ways to invite testers to a closed track. They
        feel similar but behave differently.
      </p>
      <h2>1. Email list</h2>
      <p>
        Paste comma-separated Google emails. Simplest. Each tester gets an opt-in
        URL automatically. Best for &lt;50 testers.
      </p>
      <h2>2. Google Group</h2>
      <p>
        Create a Google Group, paste the group address into Play Console. Anyone
        in the group is a tester. Best when testers self-manage join/leave.
      </p>
      <h2>3. Opt-in URL</h2>
      <p>
        Public URL anyone can click to become a tester. Best for community
        recruitment. Note: this is still &ldquo;closed&rdquo; testing — Google
        doesn&apos;t list it publicly.
      </p>
      <h2>Which one Google recommends</h2>
      <p>
        For the 12-tester gate, Google&apos;s docs lean toward email list or Google
        Group because it&apos;s easier to verify the testers exist. The opt-in URL
        is fine in practice as long as you confirm 12 distinct accounts opt in.
      </p>
    </>
  );
}

function ExtendClosedTestingAfterProduction() {
  return (
    <>
      <p>
        Once Google grants production access, do you still need to run closed
        testing? Strictly, no. Practically, often yes.
      </p>
      <h2>What changes after production</h2>
      <ul>
        <li>The 12-tester gate is satisfied permanently for that account.</li>
        <li>You can stop the closed test track without penalty.</li>
        <li>Future apps on the same account skip the gate.</li>
      </ul>
      <h2>Why keep closed testing running</h2>
      <ul>
        <li>Catch regressions before pushing to production rollouts.</li>
        <li>Test risky changes (paid features, auth migrations) on a known cohort.</li>
        <li>Build a relationship with engaged users you can ask for feedback.</li>
      </ul>
      <h2>The lighter alternative</h2>
      <p>
        Switch to <em>internal</em> testing (no review, fast publish) for your dev
        team, and add staged rollouts in production for broader risk control.
        Keep closed testing only if you have engaged external testers worth
        retaining.
      </p>
    </>
  );
}

function RecoverFromDroppedTesters() {
  return (
    <>
      <p>
        It&apos;s day 11. You just noticed one tester uninstalled. You&apos;re at
        11 active. What happens to the clock?
      </p>
      <h2>What Google&apos;s counter does</h2>
      <p>
        The moment you dropped below 12, the &ldquo;14 consecutive days with 12+
        active&rdquo; condition broke. The clock didn&apos;t reset to zero — it
        broke the streak. When you re-add a 12th active tester, a new 14-day
        streak begins from that moment.
      </p>
      <h2>The recovery playbook</h2>
      <ol>
        <li>Recruit 2–3 new testers immediately. Don&apos;t aim for 12 — aim for 15.</li>
        <li>Brief them on the opt-in URL. Confirm install + open within 24 hours.</li>
        <li>Check the tester report the next day. Confirm you&apos;re at 12+ active.</li>
        <li>Restart your day counter from this moment.</li>
      </ol>
      <h2>Why buffer matters</h2>
      <p>
        If you had recruited 15 from day 0, you&apos;d be at 14 active right now —
        no problem. Buffer is the cheapest insurance against the day-11 panic.
      </p>
    </>
  );
}

function RecruitTestersNicheApps() {
  return (
    <>
      <p>
        Your app is for Norwegian fish photographers, or Tamil-language
        accountants, or amateur radio operators. The generic Reddit threads
        won&apos;t help. Here&apos;s how to source testers when your audience is
        small.
      </p>
      <h2>The shift in tactics</h2>
      <p>
        For broad apps, testers don&apos;t need to match your audience — they
        just need a Google account. For niche apps, you can still get away with
        non-matching testers for the <em>12-tester gate</em>, but you&apos;ll get
        useful feedback only from in-niche people. Decouple the two.
      </p>
      <h2>The two-cohort approach</h2>
      <ol>
        <li><strong>Gate cohort:</strong> 12+ generic indie devs from <a href="/">AppTest</a> or Reddit. Job: satisfy Google&apos;s rule.</li>
        <li><strong>Feedback cohort:</strong> 3–5 in-niche users you recruited via niche communities, forums, or DMs. Job: give you signal.</li>
      </ol>
      <h2>Where to find the niche cohort</h2>
      <ul>
        <li>Subreddits specific to the vertical (r/amateurradio, r/photography).</li>
        <li>Facebook groups (often the largest active community for niche verticals).</li>
        <li>Existing tools&apos; users — search &ldquo;[competitor] reddit&rdquo; for unhappy users.</li>
      </ul>
    </>
  );
}

function BetafamilyVsApptest() {
  return (
    <>
      <p>
        Honest comparison: BetaFamily and AppTest solve adjacent but different
        problems. Picking the wrong one wastes weeks.
      </p>
      <h2>BetaFamily</h2>
      <ul>
        <li>Crowd-testing marketplace with over a million testers.</li>
        <li>Best for: detailed UX feedback, paid bug hunts, device coverage.</li>
        <li>Not optimized for: the 12-tester / 14-day Play gate specifically.</li>
        <li>Pricing: paid plans for full features.</li>
      </ul>
      <h2>AppTest</h2>
      <ul>
        <li>Built specifically for the Google Play 12-tester rule.</li>
        <li>Best for: mutual swap testing among indie Android devs.</li>
        <li>Free. No paid tiers.</li>
        <li>Testers are themselves Play developers — strong reciprocity.</li>
      </ul>
      <h2>Use both, for different reasons</h2>
      <p>
        BetaFamily is excellent when you want a UX report from a wide range of
        users. AppTest is the fast lane when you need 12 active testers
        <em>this week</em> to unlock production. They aren&apos;t competitors so
        much as different stages of your launch.
      </p>
    </>
  );
}

function PrimeTestLabVsMutualTesting() {
  return (
    <>
      <p>
        PrimeTestLab will sell you 12 pre-qualified testers for around $15–30.
        Mutual swap communities deliver free testers but cost you time. Which
        actually costs less?
      </p>
      <h2>Real cost of PrimeTestLab</h2>
      <ul>
        <li>$15–30 per cohort.</li>
        <li>Delivery in hours.</li>
        <li>Trust risk: if the accounts get flagged later, no refund.</li>
        <li>Zero feedback value — testers won&apos;t use the app meaningfully.</li>
      </ul>
      <h2>Real cost of mutual testing</h2>
      <ul>
        <li>$0.</li>
        <li>Delivery in 24–72 hours typically.</li>
        <li>You also have to test 1–3 other apps in return. Budget 30–60 minutes.</li>
        <li>Some feedback bonus — testers occasionally leave notes.</li>
      </ul>
      <h2>The honest call</h2>
      <p>
        If your time costs more than $30/hour and you&apos;re in a rush:
        PrimeTestLab. If you have any flexibility and want a sustainable approach
        for app two, three, four: mutual via <a href="/">AppTest</a> or similar.
      </p>
    </>
  );
}

function PaidGooglePlayTestersWorthIt() {
  return (
    <>
      <p>
        Paid testing services advertise &ldquo;12 testers delivered, guaranteed.&rdquo;
        What you actually get varies a lot.
      </p>
      <h2>What you usually get</h2>
      <ul>
        <li>12 Google accounts that opt in to your closed track.</li>
        <li>Most install the app and let the device phone home.</li>
        <li>None of them use the app meaningfully.</li>
        <li>No usable product feedback.</li>
      </ul>
      <h2>What you sometimes get</h2>
      <ul>
        <li>Accounts that Google later flags retroactively — cohort disqualified.</li>
        <li>Drop-offs around day 10 if the service oversold capacity.</li>
        <li>Refusal to refund when production access stays locked.</li>
      </ul>
      <h2>When paid is actually the right call</h2>
      <ul>
        <li>You&apos;re an experienced dev launching a polished app.</li>
        <li>You&apos;ve already failed once with friends-and-family.</li>
        <li>The cost ($15–50) is less than another month of delay.</li>
      </ul>
      <p>
        Pick services with verified Google account hygiene reviews. Avoid Fiverr.
      </p>
    </>
  );
}

function FiverrTestersRejected() {
  return (
    <>
      <p>
        Fiverr gigs offering &ldquo;12 Google Play testers for $5&rdquo; sound
        irresistible. They&apos;re also the fastest way to fail the 12-tester
        gate.
      </p>
      <h2>Why Fiverr testers usually fail</h2>
      <ul>
        <li>The same seller has serviced hundreds of apps with the same accounts.</li>
        <li>Google&apos;s anti-abuse system has fingerprinted those accounts.</li>
        <li>When the system flags them, they get retroactively disqualified.</li>
        <li>Your cohort drops below 12. The 14-day clock breaks.</li>
      </ul>
      <h2>The give-away signals</h2>
      <ul>
        <li>Prices under $20 for 12 testers.</li>
        <li>&ldquo;Same day delivery&rdquo; with no questions about your app.</li>
        <li>Reviews that are oddly identical or non-specific.</li>
      </ul>
      <h2>What to do instead</h2>
      <p>
        Free mutual testing via <a href="/">AppTest</a> is the lowest-risk
        replacement. Paid services with verified account hygiene (look for
        independent reviews on r/AndroidDev) are acceptable if you&apos;ve
        exhausted the free route.
      </p>
    </>
  );
}

function FreeVsPaidTesters() {
  return (
    <>
      <p>
        Side-by-side breakdown of the three realistic paths to 12 testers, ranked
        by total cost (money + time).
      </p>
      <h2>1. Free mutual testing</h2>
      <ul>
        <li>Cost: $0 + your time (30–60 min testing other apps).</li>
        <li>Speed: 24–72 hours.</li>
        <li>Risk: low — testers are real Play devs.</li>
        <li>Bonus: occasional feedback.</li>
      </ul>
      <h2>2. Reddit / Discord asks</h2>
      <ul>
        <li>Cost: $0 + ~1 hour writing posts.</li>
        <li>Speed: 1–7 days.</li>
        <li>Risk: low.</li>
        <li>Bonus: discovery — your app gets seen by other devs.</li>
      </ul>
      <h2>3. Paid services</h2>
      <ul>
        <li>Cost: $15–50.</li>
        <li>Speed: hours.</li>
        <li>Risk: medium — account quality varies.</li>
        <li>No feedback bonus.</li>
      </ul>
      <h2>Recommended sequence</h2>
      <p>
        Try free mutual first (<a href="/">AppTest</a>). If you don&apos;t hit 12
        within 72 hours, layer in Reddit. Only go paid if you&apos;ve genuinely
        exhausted both.
      </p>
    </>
  );
}

function TestFlightVsClosedTesting() {
  return (
    <>
      <p>
        If you&apos;re crossing over from iOS, Google Play closed testing will
        surprise you. Here are the TestFlight habits to unlearn.
      </p>
      <h2>What&apos;s similar</h2>
      <ul>
        <li>Both let you distribute pre-production builds to a closed group.</li>
        <li>Both require a review before testers can install.</li>
        <li>Both surface crash and feedback data.</li>
      </ul>
      <h2>What&apos;s different</h2>
      <ul>
        <li><strong>The 14-day gate.</strong> TestFlight has no equivalent. Apple lets you ship after internal testing.</li>
        <li><strong>Tester limits.</strong> TestFlight: 10,000 external. Play closed: thousands but capped by track.</li>
        <li><strong>Invite mechanics.</strong> TestFlight uses email + redeem codes. Play uses opt-in URLs + Groups.</li>
        <li><strong>Review duration.</strong> TestFlight first review is often longer than Play&apos;s closed-testing review.</li>
      </ul>
      <h2>The mental shift</h2>
      <p>
        On iOS, TestFlight is a convenience. On Android, closed testing is a
        <em>gate</em>. Plan your 14-day window like a hard milestone, not an
        optional QA pass.
      </p>
    </>
  );
}

function UserTestingVsMutualTesting() {
  return (
    <>
      <p>
        UserTesting and similar UX research platforms are great for what they do.
        They&apos;re not a substitute for the 12-tester gate.
      </p>
      <h2>What UserTesting is for</h2>
      <ul>
        <li>Recorded user-research sessions on prototypes or live apps.</li>
        <li>Targeted demographic recruitment.</li>
        <li>Structured task-based feedback.</li>
        <li>Costs $30–100+ per session.</li>
      </ul>
      <h2>Why it doesn&apos;t satisfy Google&apos;s rule</h2>
      <ul>
        <li>Testers aren&apos;t opted into your closed-test track.</li>
        <li>Their devices don&apos;t phone home to Google Play.</li>
        <li>Sessions end — no 14-day retention.</li>
      </ul>
      <h2>What to use for what</h2>
      <p>
        Use UserTesting for usability sessions on your live app post-launch. Use
        a mutual-testing community like <a href="/">AppTest</a> to clear the
        12-tester gate. Different jobs, different tools.
      </p>
    </>
  );
}

function HowMutualTestingReciprocityWorks() {
  return (
    <>
      <p>
        Mutual-testing exchanges outperform paid platforms for the 12-tester rule.
        The reason is structural: reciprocity.
      </p>
      <h2>The mechanism</h2>
      <ul>
        <li>Every developer on the platform has the same 12-tester problem.</li>
        <li>Testing someone else&apos;s app is the cost of admission.</li>
        <li>This filters out drive-by accounts — only people who actually need testers stay.</li>
        <li>The accounts are real, by definition.</li>
      </ul>
      <h2>Why paid services don&apos;t reach the same quality</h2>
      <p>
        Paid testers have no reason to engage. They opt in, install, and move on.
        Mutual testers might leave a quick note, share to their network, or
        return for app two and three.
      </p>
      <h2>The norms that make it work</h2>
      <ul>
        <li>Test as many apps as you ask testers for. Net-zero balance.</li>
        <li>Brief other devs the way you want to be briefed.</li>
        <li>Leave a 1-sentence note if anything obvious is broken.</li>
      </ul>
      <p>
        Communities die when reciprocity dies. Be the dev who shows up.
      </p>
    </>
  );
}

function FixNotEnoughTestersError() {
  return (
    <>
      <p>
        Play Console&apos;s &ldquo;not enough testers&rdquo; message is vague.
        Here are the five fixes, in order of likelihood.
      </p>
      <h2>1. Some testers never opened the app</h2>
      <p>
        Check the tester report. If the install column says &ldquo;not
        installed&rdquo; or status is &ldquo;inactive,&rdquo; chase those testers
        directly.
      </p>
      <h2>2. You&apos;re reading the wrong number</h2>
      <p>
        The headline number on the closed-testing page may include opted-in but
        inactive testers. Check the explicit &ldquo;active&rdquo; column on the
        tester report.
      </p>
      <h2>3. A tester opted in twice with different accounts</h2>
      <p>
        Counts as one. Confirm 12 distinct emails are active.
      </p>
      <h2>4. The track is internal, not closed</h2>
      <p>
        Only closed counts. If you&apos;ve been running internal, set up a closed
        track and restart the recruitment.
      </p>
      <h2>5. Lag between client phone-home and console</h2>
      <p>
        Recent installs may take 24+ hours to show. If you literally just got
        your 12th opt-in, wait a day and recheck.
      </p>
    </>
  );
}

function ClosedTestingRejectedFixes() {
  return (
    <>
      <p>
        Closed-testing rejections are uncommon but unsettling. Here&apos;s what to
        do.
      </p>
      <h2>Read the email carefully</h2>
      <p>
        Google specifies the violation: content policy, monetization,
        permissions, target SDK. The exact reason determines the fix.
      </p>
      <h2>The most common rejections</h2>
      <ul>
        <li><strong>Target SDK too low.</strong> Bump to the current target SDK level.</li>
        <li><strong>Missing privacy policy.</strong> Add a hosted URL in Play Console.</li>
        <li><strong>Sensitive permissions without disclosure.</strong> Either remove or add Permissions Declaration.</li>
        <li><strong>Misleading metadata.</strong> Adjust the short description and screenshots.</li>
      </ul>
      <h2>The appeal path</h2>
      <p>
        Fix the issue, upload a new release to the same track, submit for review.
        Don&apos;t submit an appeal without changing anything — Google won&apos;t
        overturn without a delta.
      </p>
      <h2>Re-review time</h2>
      <p>
        Faster than the first review — usually 24–48 hours.
      </p>
    </>
  );
}

function FourteenDayTimerResetCauses() {
  return (
    <>
      <p>
        The 14-day clock can break for reasons you don&apos;t immediately see.
        Five common causes.
      </p>
      <h2>1. A tester uninstalled</h2>
      <p>
        Drops your active count below 12. The streak breaks. Most common cause.
      </p>
      <h2>2. Google flagged an account</h2>
      <p>
        If anti-abuse flags a tester retroactively, they&apos;re removed from your
        active count silently.
      </p>
      <h2>3. A tester opted out</h2>
      <p>
        Testers can leave the program from the opt-in URL or Google Group settings.
        Quiet drop.
      </p>
      <h2>4. You pushed a new release</h2>
      <p>
        Some major release updates require re-review. During re-review, testers
        can&apos;t install the new build, which may stall their &ldquo;active&rdquo;
        status if devices were waiting on an update.
      </p>
      <h2>5. The track changed type</h2>
      <p>
        Switching from closed to open testing (or vice versa) breaks the streak.
      </p>
      <p>
        Defense: always recruit 15+. Check the tester report on day 3, 7, 10.
      </p>
    </>
  );
}

function TestingTrackStuckTroubleshooting() {
  return (
    <>
      <p>
        You uploaded your bundle, set up testers, and the track shows zero
        activity. Walk through these seven causes.
      </p>
      <h2>1. Review is still pending</h2>
      <p>
        First release on a new track is reviewed. Testers see &ldquo;not
        available&rdquo; until review completes. Usually a few hours.
      </p>
      <h2>2. The opt-in URL points to a different track</h2>
      <p>
        Each track has its own URL. If you&apos;ve created multiple tracks,
        confirm you shared the closed-testing one, not internal.
      </p>
      <h2>3. Testers are in the wrong country</h2>
      <p>
        If your release rolled out to specific countries only, testers elsewhere
        won&apos;t see the app.
      </p>
      <h2>4. Device incompatibility</h2>
      <p>
        Min SDK too high, target architecture mismatch, or required features your
        tester&apos;s device lacks.
      </p>
      <h2>5. Tester used a non-Google-account device</h2>
      <p>
        Huawei phones without Google Services can&apos;t test.
      </p>
      <h2>6. Tester opted in but didn&apos;t install</h2>
      <p>
        Common. Send a follow-up message.
      </p>
      <h2>7. Tester installed but app is dormant</h2>
      <p>
        They need to actually open it for the device to phone home.
      </p>
    </>
  );
}

function TesterNotShowingActive() {
  return (
    <>
      <p>
        A tester says they opted in and installed. Play Console says they&apos;re
        inactive. Four reasons.
      </p>
      <h2>1. Console lag</h2>
      <p>
        Updates roughly daily. If they installed in the last 24 hours, wait.
      </p>
      <h2>2. They never opened the app</h2>
      <p>
        The device only phones home after the app opens once. Ask them to open it.
      </p>
      <h2>3. Sideloaded instead of installed via Play</h2>
      <p>
        If you sent them an APK, the install doesn&apos;t count. They must install
        from Play&apos;s tester listing.
      </p>
      <h2>4. They opted in with one account but installed with another</h2>
      <p>
        Multi-account Android phones make this easy. The Google account on the
        Play app must match the opt-in.
      </p>
      <p>
        The fastest check: ask the tester to open Play Store &rarr; search your
        app &rarr; confirm the &ldquo;You&apos;re a tester&rdquo; banner appears.
      </p>
    </>
  );
}

function ProductionAccessDenied() {
  return (
    <>
      <p>
        You did the 14 days. Google still won&apos;t grant production access.
        Three things to check before contacting support.
      </p>
      <h2>1. The 14 days weren&apos;t consecutive</h2>
      <p>
        Drops below 12 on any day reset the streak. Check the tester report
        history.
      </p>
      <h2>2. Account verification is pending</h2>
      <p>
        ID, address, payment profile — any unresolved verification blocks
        production access independently.
      </p>
      <h2>3. The track was reviewed but the production track wasn&apos;t</h2>
      <p>
        Closed-testing review and production-eligibility review are separate.
        Submit your production release.
      </p>
      <h2>Then: contact support</h2>
      <p>
        If those are all clean, Play Console &rarr; Help &rarr; Contact us.
        Include screenshots of the tester report showing 12+ active for 14
        consecutive days, and your verified account status. Response in 2–5
        business days typically.
      </p>
    </>
  );
}

function ClosedTestingReviewTime() {
  return (
    <>
      <p>
        Closed-testing review times changed in 2026. Here&apos;s what to expect.
      </p>
      <h2>First review on a new track</h2>
      <p>
        Usually a few hours, occasionally up to 3 days. New accounts with no
        verification history sit on the longer end.
      </p>
      <h2>Subsequent releases on the same track</h2>
      <p>
        Often minutes for patch updates with no metadata changes. Up to 24 hours
        if you change app content or permissions.
      </p>
      <h2>What slows review</h2>
      <ul>
        <li>Sensitive permissions (location, SMS, accessibility).</li>
        <li>Major metadata changes (app name, category).</li>
        <li>Account-level signals (new account, no production apps).</li>
        <li>Holiday weekends.</li>
      </ul>
      <h2>What you can do</h2>
      <p>
        Submit early in the week, during US business hours. Don&apos;t resubmit
        if you&apos;re within a 48-hour window — it can reset your place in queue.
      </p>
    </>
  );
}

function CommonClosedTestingMistakes() {
  return (
    <>
      <p>
        Eight mistakes that quietly cost indie devs the 14-day window.
      </p>
      <ol>
        <li><strong>Recruiting exactly 12.</strong> No buffer. One drop = restart.</li>
        <li><strong>Skipping the briefing email.</strong> Testers don&apos;t open the app.</li>
        <li><strong>Sharing the wrong URL.</strong> Internal-track URL doesn&apos;t count.</li>
        <li><strong>Not checking the tester report.</strong> Drops go unnoticed.</li>
        <li><strong>Sideloading APKs instead of using Play.</strong> Installs don&apos;t count.</li>
        <li><strong>Using your own burner accounts.</strong> Anti-abuse flags them.</li>
        <li><strong>Pushing major updates mid-window.</strong> Devices fall out of active state during re-review.</li>
        <li><strong>Forgetting verification.</strong> Production stays locked even after 14 days.</li>
      </ol>
      <p>
        Avoid these and the 14-day window is the easiest part of launching on
        Play.
      </p>
    </>
  );
}

function PreLaunchAndroidChecklist() {
  return (
    <>
      <p>
        Nail these before you start the 14-day clock — otherwise day 14 ends in a
        rejection.
      </p>
      <h2>App config</h2>
      <ul>
        <li>Target SDK at current Play minimum.</li>
        <li>App signed with Play App Signing.</li>
        <li>Bundle (AAB) size under 200MB; assets split for larger.</li>
      </ul>
      <h2>Metadata</h2>
      <ul>
        <li>Short description (80 chars, with primary keyword).</li>
        <li>Long description (4000 chars, scannable).</li>
        <li>2–8 screenshots, at least one feature graphic.</li>
        <li>App icon, hi-res 512x512.</li>
      </ul>
      <h2>Compliance</h2>
      <ul>
        <li>Privacy policy URL.</li>
        <li>Content rating questionnaire completed.</li>
        <li>Data Safety form completed.</li>
        <li>Permissions declaration for any sensitive permissions.</li>
      </ul>
      <h2>Account</h2>
      <ul>
        <li>ID verification approved.</li>
        <li>Address verification approved.</li>
        <li>Payment profile complete (even for free apps).</li>
      </ul>
      <p>
        Print this. Tick it before day 0.
      </p>
    </>
  );
}

function ValidateAndroidAppIdea() {
  return (
    <>
      <p>
        Closed testing isn&apos;t validation — it&apos;s a publishing gate. Validate
        before you spend the 14 days.
      </p>
      <h2>The cheapest validation tactics</h2>
      <ul>
        <li><strong>Landing page test.</strong> Build a one-page site, run $50 of ads to the target audience, measure email signups.</li>
        <li><strong>Reddit discovery.</strong> Search r/AndroidApps and r/AppHookup for unsolved problems near your idea.</li>
        <li><strong>Competitor reviews.</strong> Read 1-star reviews on existing apps. The complaints are your feature backlog.</li>
        <li><strong>Manual prototype.</strong> Spreadsheet, Notion page, or webform that solves the problem without code.</li>
      </ul>
      <h2>What validation should answer</h2>
      <p>
        Will at least 100 people pay $5/month, or 10,000 use it free? If the
        answer&apos;s &ldquo;maybe,&rdquo; keep validating. If it&apos;s
        &ldquo;no,&rdquo; pivot before you build.
      </p>
      <h2>The order</h2>
      <p>
        Validate &rarr; build &rarr; closed test &rarr; launch. Skipping
        validation and going straight to closed testing means you might ship a
        polished app nobody wants.
      </p>
    </>
  );
}

function IndieAndroidMarketingFirst100() {
  return (
    <>
      <p>
        You shipped. Production access granted. Now what? A no-budget marketing
        playbook for your first 100 users.
      </p>
      <h2>Week 1 — Launch posts</h2>
      <ul>
        <li>r/AndroidApps with a structured launch post.</li>
        <li>Hacker News &ldquo;Show HN&rdquo;.</li>
        <li>Product Hunt.</li>
        <li>IndieHackers showcase.</li>
        <li>X / Twitter with #AndroidDev hashtag and visuals.</li>
      </ul>
      <h2>Weeks 2–4 — Communities</h2>
      <ul>
        <li>Niche subreddits relevant to your app.</li>
        <li>Facebook groups for your vertical.</li>
        <li>Niche Discord servers — engage first, post second.</li>
      </ul>
      <h2>Ongoing — Content</h2>
      <ul>
        <li>One blog post per week answering a question your users ask.</li>
        <li>One Twitter / Mastodon thread per week sharing a build-in-public update.</li>
      </ul>
      <h2>Track what works</h2>
      <p>
        Tag every install source you can. Double down on the one or two
        channels delivering installs that retain.
      </p>
    </>
  );
}

function PlayStoreDescriptionConverts() {
  return (
    <>
      <p>
        Your Play Store listing is your homepage. Most devs treat it as
        documentation and lose 30% of potential installs.
      </p>
      <h2>The short description (80 chars)</h2>
      <p>
        Indexed for ASO. Use your primary keyword once. Make it a benefit, not a
        feature.
      </p>
      <h2>The long description (4000 chars)</h2>
      <ul>
        <li>First 2 lines: the hook (visible without expanding).</li>
        <li>Then: 3–5 key benefits as scannable bullets.</li>
        <li>Then: social proof — reviews, press, install count.</li>
        <li>Last paragraph: secondary keywords naturally woven in.</li>
      </ul>
      <h2>The mistake 80% of devs make</h2>
      <p>
        Writing a feature list. Features tell, benefits sell. &ldquo;Offline
        sync&rdquo; is a feature. &ldquo;Your notes available even on the
        subway&rdquo; is a benefit.
      </p>
      <h2>A/B test it</h2>
      <p>
        Play Console &rarr; Store Listing Experiments. Test the short description
        first — biggest lever, smallest write.
      </p>
    </>
  );
}

function AndroidScreenshotsDriveInstalls() {
  return (
    <>
      <p>
        Three screenshots do 80% of your conversion work. Stop screenshotting raw
        screens.
      </p>
      <h2>The structure that converts</h2>
      <ol>
        <li><strong>Screenshot 1:</strong> A bold headline + the single biggest benefit (&ldquo;Track expenses without typing&rdquo;).</li>
        <li><strong>Screenshot 2:</strong> The key feature visualized, with a one-line caption.</li>
        <li><strong>Screenshot 3:</strong> Social proof or transformation (&ldquo;Used by 10k indie devs&rdquo;).</li>
      </ol>
      <h2>Design rules</h2>
      <ul>
        <li>Headline text 50%+ of the screen height. Real screen pixels are tiny on a phone.</li>
        <li>One idea per screenshot. Don&apos;t cram.</li>
        <li>Brand color in the background to stand out from competitor blue/white.</li>
      </ul>
      <h2>Tools</h2>
      <p>
        Figma + free Pixel mockup template. AppMockup.com for quick exports.
        Don&apos;t pay for fancy mockup generators — minimal mockups outperform
        ornate ones on conversion.
      </p>
    </>
  );
}

function IndieAndroidCommunityGuide() {
  return (
    <>
      <p>
        Every active indie Android community worth following in 2026. Updated
        based on real engagement, not vanity counts.
      </p>
      <h2>Reddit</h2>
      <ul>
        <li><strong>r/AndroidDev</strong> — biggest, active weekly threads.</li>
        <li><strong>r/IndieDev</strong> — cross-platform but Android welcomed.</li>
        <li><strong>r/TestersCommunity</strong> — built for the 12-tester rule.</li>
        <li><strong>r/SideProject</strong> — launch announcements.</li>
      </ul>
      <h2>Discord</h2>
      <ul>
        <li>The Android Developers Discord.</li>
        <li>Kotlin Lang.</li>
        <li>Indie Hackers.</li>
      </ul>
      <h2>X / Twitter</h2>
      <ul>
        <li>#AndroidDev, #IndieDev hashtags.</li>
        <li>Follow Android engineering accounts at Google for policy news.</li>
      </ul>
      <h2>Newsletters</h2>
      <ul>
        <li>Android Weekly.</li>
        <li>Kotlin Weekly.</li>
        <li>Indie Hackers Daily.</li>
      </ul>
      <p>
        Pick two. More than two and you&apos;ll spend more time reading than
        building.
      </p>
    </>
  );
}

function ClosedToProductionTimeline() {
  return (
    <>
      <p>
        A realistic day-by-day timeline from new Play Console account to live app
        in production. Buffer included.
      </p>
      <h2>Day 0–2: Account setup</h2>
      <ul>
        <li>Create account, $25 fee.</li>
        <li>Submit ID + address. Verification 1–7 days.</li>
      </ul>
      <h2>Day 3–7: App prep</h2>
      <ul>
        <li>Build signed AAB.</li>
        <li>Privacy policy hosted.</li>
        <li>Store listing, screenshots, content rating.</li>
      </ul>
      <h2>Day 8: Closed track + tester recruitment</h2>
      <ul>
        <li>Create closed testing track, upload AAB.</li>
        <li>Submit for review (a few hours).</li>
        <li>Recruit 15 testers.</li>
      </ul>
      <h2>Day 9: Testers active</h2>
      <p>
        12+ testers active. The 14-day clock starts.
      </p>
      <h2>Day 23: 14-day window complete</h2>
      <ul>
        <li>Verify 12+ active throughout. Submit production release.</li>
        <li>Production review: 1–7 days for first app, often faster.</li>
      </ul>
      <h2>Day 30 (realistic best case): Live</h2>
      <p>
        Most indie devs hit production around day 30–40 of starting the account.
        Plan accordingly.
      </p>
    </>
  );
}

function AndroidOnABudget() {
  return (
    <>
      <p>
        The indie Android stack that costs under $20/month — and most of it is
        free.
      </p>
      <h2>IDE and code</h2>
      <ul>
        <li>Android Studio — free.</li>
        <li>GitHub Free — unlimited private repos.</li>
      </ul>
      <h2>Design</h2>
      <ul>
        <li>Figma Free — covers solo design needs.</li>
        <li>Icons8 / Streamline (free tiers) for icons.</li>
        <li>AppMockup.com for screenshots.</li>
      </ul>
      <h2>Backend (if needed)</h2>
      <ul>
        <li>Supabase free tier — Postgres + auth + storage.</li>
        <li>Cloudflare Workers — free for low traffic.</li>
        <li>Hetzner $6/month box — Postgres + your own API.</li>
      </ul>
      <h2>Analytics</h2>
      <ul>
        <li>Firebase Free — analytics + crashlytics.</li>
        <li>Posthog Cloud free tier — product analytics.</li>
      </ul>
      <h2>Marketing</h2>
      <ul>
        <li>Plausible $9/month — privacy-friendly web analytics.</li>
        <li>Buffer free — schedule X posts.</li>
        <li><a href="/">AppTest</a> — free testers.</li>
      </ul>
    </>
  );
}

function PlayConsolePersonalAccountRequirements() {
  return (
    <>
      <p>
        What gates a new Google Play personal account in 2026.
      </p>
      <h2>At signup</h2>
      <ul>
        <li>$25 one-time fee.</li>
        <li>Government-issued ID upload.</li>
        <li>Address proof (utility bill or bank statement).</li>
      </ul>
      <h2>Before first publish</h2>
      <ul>
        <li>Identity verification complete.</li>
        <li>Address verification complete.</li>
        <li>Payment profile complete (even for free apps).</li>
        <li>Privacy policy hosted.</li>
        <li>Data Safety form filled.</li>
      </ul>
      <h2>Before production access</h2>
      <ul>
        <li>The 12-tester / 14-day closed-testing requirement.</li>
        <li>Account in good standing — no unresolved policy strikes.</li>
      </ul>
      <h2>Timeline</h2>
      <p>
        Verification: usually 1–7 days. Slowest part of the whole process. Start
        it the day you create the account, not the day you&apos;re ready to
        ship.
      </p>
    </>
  );
}

function GooglePlayPolicyChanges2026() {
  return (
    <>
      <p>
        Every meaningful Play policy change in 2026 that affects indie devs.
      </p>
      <h2>Target SDK bump</h2>
      <p>
        Annual bump to the previous year&apos;s API level. Confirm your build
        targets the current minimum or new uploads are rejected.
      </p>
      <h2>Data Safety form expansion</h2>
      <p>
        More categories around AI/ML processing. Re-review your form if your app
        uses on-device or cloud AI.
      </p>
      <h2>Permissions tightening</h2>
      <p>
        Accessibility, SMS, and All Files Access continue to get stricter
        scrutiny. Document use cases and justify in the Permissions Declaration.
      </p>
      <h2>Subscription disclosure</h2>
      <p>
        Subscription apps must show pricing more prominently in the listing.
        Existing apps were notified in early 2026 with a deadline.
      </p>
      <h2>Closed-testing rule unchanged</h2>
      <p>
        Still 12 testers, 14 days, personal accounts created after 2023-11-13.
        No signal Google plans to ease or tighten this in 2026.
      </p>
    </>
  );
}

function TestingRequirementsNewAccounts() {
  return (
    <>
      <p>
        Google&apos;s testing requirements for new accounts in plain English.
      </p>
      <h2>Who it applies to</h2>
      <p>
        Personal accounts created on or after 2023-11-13. Organization accounts
        are exempt.
      </p>
      <h2>What you must do</h2>
      <ul>
        <li>Set up a closed testing track.</li>
        <li>Have at least 12 testers opted in.</li>
        <li>Maintain 12+ active testers for 14 continuous days.</li>
      </ul>
      <h2>The parts most devs misread</h2>
      <ul>
        <li><strong>&ldquo;Continuous&rdquo;</strong> means uninterrupted. Drop below 12 = restart.</li>
        <li><strong>&ldquo;Active&rdquo;</strong> means the device phoned home, not just opted in.</li>
        <li><strong>&ldquo;Personal&rdquo;</strong> includes accounts that look corporate but were registered under a person.</li>
        <li><strong>&ldquo;Closed&rdquo;</strong> testing specifically — internal and open don&apos;t count.</li>
      </ul>
      <h2>What happens once you clear it</h2>
      <p>
        Production access unlocks for that account permanently. All future apps
        on the same account skip the gate.
      </p>
    </>
  );
}

function ProductionAccessCriteria() {
  return (
    <>
      <p>
        What Google checks before granting production access, beyond the 12
        testers / 14 days.
      </p>
      <h2>The explicit checks</h2>
      <ul>
        <li>12-tester / 14-day closed testing satisfied.</li>
        <li>App passes policy review for the production release.</li>
        <li>Account verification complete.</li>
        <li>No active enforcement actions.</li>
      </ul>
      <h2>The implicit signals</h2>
      <ul>
        <li>Crash rate during closed testing. Very high crash rates can delay approval.</li>
        <li>Tester drop-off pattern. Mass uninstall mid-window raises flags.</li>
        <li>Account age. Newer accounts get more scrutiny.</li>
      </ul>
      <h2>How to pre-clear each</h2>
      <ul>
        <li>Test major flows on real devices before closed testing.</li>
        <li>Brief testers so they don&apos;t mass-uninstall.</li>
        <li>Start ID verification day 0.</li>
        <li>Run policy compliance check (Play Console offers one) before submission.</li>
      </ul>
    </>
  );
}

function ClosedTestingDataCollected() {
  return (
    <>
      <p>
        What data flows during closed testing — yours, Google&apos;s, and your
        testers&apos;.
      </p>
      <h2>What Google sees</h2>
      <ul>
        <li>Tester opt-in / opt-out events.</li>
        <li>Install / uninstall events.</li>
        <li>Crash and ANR reports (if enabled).</li>
        <li>Device fingerprints for anti-abuse.</li>
      </ul>
      <h2>What you see in Play Console</h2>
      <ul>
        <li>Aggregate active tester count.</li>
        <li>Per-tester install status (yes/no, not behaviour).</li>
        <li>Crash and ANR reports if you&apos;ve enabled them.</li>
      </ul>
      <h2>What your app itself collects</h2>
      <p>
        Whatever your code collects — analytics SDKs, crash reporters, your own
        backend. This is separate from Play&apos;s data.
      </p>
      <h2>What you must disclose</h2>
      <ul>
        <li>Anything your app collects must be in the Data Safety form and privacy policy.</li>
        <li>Disclosure applies to testing too, not just production.</li>
      </ul>
    </>
  );
}

function PrivacyRequirementsBetaTesting() {
  return (
    <>
      <p>
        Your privacy policy needs to cover beta testing. Most indie devs miss
        this and get flagged at review.
      </p>
      <h2>What Google requires</h2>
      <ul>
        <li>A privacy policy URL (hosted, accessible without login).</li>
        <li>Disclosure of all data your app collects during testing or production.</li>
        <li>Disclosure of third-party SDKs (analytics, crash reporting, ads).</li>
      </ul>
      <h2>A copy-paste clause for beta testing</h2>
      <blockquote>
        <p>
          During beta and closed testing, [App Name] may collect additional crash
          and diagnostic data through Google Play Console. This data is used
          solely to identify and fix bugs before public release. No personally
          identifying information is collected beyond what is described elsewhere
          in this policy. Testers can opt out at any time by leaving the testing
          program.
        </p>
      </blockquote>
      <h2>Where to host it</h2>
      <p>
        GitHub Pages, Vercel, or a static page on your domain. Must be accessible
        without auth and remain at the URL you submitted.
      </p>
      <h2>Update it when SDKs change</h2>
      <p>
        Adding Firebase Analytics? Update the policy. Removing Crashlytics?
        Update the policy. Match the Data Safety form exactly.
      </p>
    </>
  );
}

export const POST_BODIES: Record<string, ComponentType> = {
  "google-play-12-testers-guide": GooglePlay12TestersGuide,
  "find-12-testers-24-hours": Find12Testers24Hours,
  "what-counts-as-active-tester": WhatCountsAsActiveTester,
  "not-enough-testers-after-14-days": NotEnoughTestersAfter14Days,
  "closed-vs-internal-vs-open-testing": ClosedVsInternalVsOpen,
  "own-google-accounts-as-testers": OwnGoogleAccountsAsTesters,
  "google-play-20-to-12-rule-change": GooglePlay20To12RuleChange,
  "personal-vs-organization-account-testing": PersonalVsOrganizationAccount,
  "does-internal-testing-count": DoesInternalTestingCount,
  "tester-uninstalls-during-14-days": TesterUninstallsDuring14Days,
  "setup-closed-testing-track-step-by-step": SetupClosedTestingStepByStep,
  "tester-briefing-email-template": TesterBriefingEmailTemplate,
  "find-testers-target-country": FindTestersTargetCountry,
  "find-testers-on-reddit": FindTestersOnReddit,
  "find-testers-on-discord": FindTestersOnDiscord,
  "monitor-active-tester-count": MonitorActiveTesterCount,
  "invite-testers-closed-testing": InviteTestersClosedTesting,
  "extend-closed-testing-after-production": ExtendClosedTestingAfterProduction,
  "recover-from-dropped-testers": RecoverFromDroppedTesters,
  "recruit-testers-niche-apps": RecruitTestersNicheApps,
  "betafamily-vs-apptest": BetafamilyVsApptest,
  "primetestlab-vs-mutual-testing": PrimeTestLabVsMutualTesting,
  "paid-google-play-testers-worth-it": PaidGooglePlayTestersWorthIt,
  "fiverr-testers-rejected": FiverrTestersRejected,
  "free-vs-paid-12-testers": FreeVsPaidTesters,
  "testflight-vs-closed-testing": TestFlightVsClosedTesting,
  "usertesting-vs-mutual-testing": UserTestingVsMutualTesting,
  "how-mutual-testing-reciprocity-works": HowMutualTestingReciprocityWorks,
  "fix-not-enough-testers-error": FixNotEnoughTestersError,
  "closed-testing-rejected-fixes": ClosedTestingRejectedFixes,
  "14-day-timer-reset-causes": FourteenDayTimerResetCauses,
  "testing-track-stuck-troubleshooting": TestingTrackStuckTroubleshooting,
  "tester-not-showing-active": TesterNotShowingActive,
  "production-access-denied": ProductionAccessDenied,
  "closed-testing-review-time": ClosedTestingReviewTime,
  "common-closed-testing-mistakes": CommonClosedTestingMistakes,
  "pre-launch-android-checklist": PreLaunchAndroidChecklist,
  "validate-android-app-idea": ValidateAndroidAppIdea,
  "indie-android-marketing-first-100": IndieAndroidMarketingFirst100,
  "play-store-description-converts": PlayStoreDescriptionConverts,
  "android-screenshots-drive-installs": AndroidScreenshotsDriveInstalls,
  "indie-android-community-guide": IndieAndroidCommunityGuide,
  "closed-to-production-timeline": ClosedToProductionTimeline,
  "android-on-a-budget": AndroidOnABudget,
  "play-console-personal-account-requirements": PlayConsolePersonalAccountRequirements,
  "google-play-policy-changes-2026": GooglePlayPolicyChanges2026,
  "testing-requirements-new-accounts": TestingRequirementsNewAccounts,
  "production-access-criteria": ProductionAccessCriteria,
  "closed-testing-data-collected": ClosedTestingDataCollected,
  "privacy-requirements-beta-testing": PrivacyRequirementsBetaTesting,
};
