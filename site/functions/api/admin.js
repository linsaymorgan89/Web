/**
 * Admin API: load/save content to KV (TEM_USERS namespace with 'admin:' prefix) for Morgan's easy content editing.
 * The admin page at /admin/ talks to this endpoint.
 * Flow:
 * - GET /api/admin?model=rates|tours|posts → load current JSON from KV (admin:site, admin:rates, etc.)
 * - POST /api/admin with action=save → write JSON to KV (admin:site, etc.)
 * - POST /api/admin with action=publish → write JSON to KV and set publish_pending flag (admin:publish_pending)
 *
 * KV namespace: TEM_USERS (reuse existing)
 * Keys: admin:site, admin:rates, admin:tours, admin:posts, admin:publish_pending (boolean timestamp)
 *
 * Note: On first load, returns empty structures; Morgan must edit and publish to seed KV.
 */

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const model = url.searchParams.get('model');
  const action = url.searchParams.get('action');

  if (action === 'export') {
    // Export all admin content for the deployer script (no auth required; called by cron)
    return await handleExport(env);
  } else if (request.method === 'GET') {
    // Load content for the admin UI
    return await handleGet(env, model);
  } else if (request.method === 'POST') {
    // Save or publish
    try {
      const body = await request.json();
      if (body.action === 'save') {
        return await handleSave(env, body.data);
      } else if (body.action === 'publish') {
        return await handlePublish(env, body.data);
      } else {
        return Response.json({ error: 'Invalid action' }, { status: 400 });
      }
    } catch (e) {
      return Response.json({ error: 'Invalid JSON: ' + e.message }, { status: 400 });
    }
  } else {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }
}

async function handleExport(env) {
  // Export all admin content for the deployer script
  // Reads admin:site, admin:rates, admin:tours, admin:posts from KV
  // Returns combined JSON
  try {
    const result = {};
    for (const model of ['site', 'rates', 'tours', 'posts']) {
      const value = await env.TEM_USERS.get('admin:' + model);
      result[model] = value ? JSON.parse(value) : null;
    }
    // Include publish timestamp if set
    const pending = await env.TEM_USERS.get('admin:publish_pending');
    result.publishPending = pending ? parseInt(pending, 10) : 0;
    return Response.json(result);
  } catch (e) {
    return Response.json({ error: 'Export failed: ' + e.message }, { status: 500 });
  }
}

async function handleGet(env, model) {
  // For now, we need to import the local JSON since we can't reach it from Workers.
  // In production, after first publish, everything lives in KV.
  // On first load, the admin will see empty data and need to "publish" once to seed KV.
  // For simplicity, we return a structured response that tells the client what models exist.
  const available = ['site', 'rates', 'tours', 'posts'];
  if (model && !available.includes(model)) {
    return Response.json({ error: 'Invalid model' }, { status: 400 });
  }

  // Try to load from KV
  try {
    if (model) {
      const value = await env.TEM_USERS.get('admin:' + model);
      if (value) {
        return Response.json(JSON.parse(value));
      } else {
        // KV not yet seeded: return empty structure
        if (model === 'site') {
          return Response.json({
            phone: '', email: '', onlyfans: '',
            goodwill: { price: '50', tagline: 'one time, forever' },
            home: { eyebrow: '', lede: '' }
          });
        } else if (model === 'rates') {
          return Response.json({
            wishlistUrl: '', wishlistLabel: '',
            local: [], touring: [], addons: []
          });
        } else if (model === 'tours') {
          return Response.json([]);
        } else if (model === 'posts') {
          return Response.json({ posts: [], categories: {} });
        }
      }
    } else {
      // Return list of models
      return Response.json({ models: available });
    }
  } catch (e) {
    return Response.json({ error: 'KV error: ' + e.message }, { status: 500 });
  }
}

async function handleSave(env, data) {
  // data is a flat key-value object from the admin form
  // We need to merge it into the correct model structures
  // For simplicity, we expect the admin to send the full model object for each changed model
  // The client will serialize the current form state and send it as { model: { ... } }
  // Here, we support direct model keys: { site: {...}, rates: {...}, tours: [...], posts: {...} }

  try {
    if (data.site) {
      await env.TEM_USERS.put('admin:site', JSON.stringify(data.site));
    }
    if (data.rates) {
      await env.TEM_USERS.put('admin:rates', JSON.stringify(data.rates));
    }
    if (data.tours) {
      await env.TEM_USERS.put('admin:tours', JSON.stringify(data.tours));
    }
    if (data.posts) {
      await env.TEM_USERS.put('admin:posts', JSON.stringify(data.posts));
    }
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: 'Save failed: ' + e.message }, { status: 500 });
  }
}

async function handlePublish(env, data) {
  // Same as save, plus set publish_pending flag
  const saveResult = await handleSave(env, data);
  if (!saveResult.ok) return saveResult;

  try {
    const timestamp = Date.now();
    await env.TEM_USERS.put('admin:publish_pending', timestamp.toString());
    return Response.json({ success: true, publishedAt: timestamp });
  } catch (e) {
    return Response.json({ error: 'Publish flag failed: ' + e.message }, { status: 500 });
  }
}