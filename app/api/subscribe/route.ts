import { NextRequest, NextResponse } from 'next/server';

// Stores emails via Mailchimp API (free up to 500 contacts)
// Requires MAILCHIMP_API_KEY and MAILCHIMP_LIST_ID in env
export async function POST(req: NextRequest) {
  try {
    const { email, siteId } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const apiKey = process.env.MAILCHIMP_API_KEY;
    const listId = process.env.MAILCHIMP_LIST_ID;

    // If Mailchimp not configured yet — just return success (don't break the UX)
    if (!apiKey || !listId) {
      console.log(`[subscribe] Email captured (no Mailchimp yet): ${email} from ${siteId}`);
      return NextResponse.json({ success: true });
    }

    // Mailchimp datacenter is the part after the dash in the API key (e.g. us21)
    const dc = apiKey.split('-')[1];
    const url = `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
        status: 'subscribed',
        tags: [siteId || 'unknown'],
        merge_fields: { SOURCE: siteId || '' },
      }),
    });

    const data = await res.json();

    // 400 with title "Member Exists" is fine — already subscribed
    if (!res.ok && data.title !== 'Member Exists') {
      console.error('[subscribe] Mailchimp error:', data);
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[subscribe] Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
