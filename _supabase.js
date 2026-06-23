/* ============================================================
   Wealth Compass · Supabase client wrapper (window.WC_DB)
   Dual-mode per Ananta playbook: if BRAND.supabase is not
   configured, every method resolves to null/[] and the site
   falls back to the baked-in static content.
   Requires (on pages that use it):
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
     <script src="_brand.js"></script>
     <script src="_supabase.js"></script>
   Compatibility: var + string concat only.
   ============================================================ */
(function () {
  'use strict';

  var _client = null;

  function configured() {
    var B = window.BRAND || {};
    var s = B.supabase || {};
    return !!(s.url && s.anonKey && s.url.indexOf('YOUR_PROJECT') < 0 &&
      typeof window.supabase !== 'undefined' && window.supabase.createClient);
  }

  function client() {
    if (!configured()) { return null; }
    if (!_client) {
      var s = window.BRAND.supabase;
      _client = window.supabase.createClient(s.url, s.anonKey);
    }
    return _client;
  }

  /* ---------- auth ---------- */
  var auth = {
    signIn: function (email, password) {
      var c = client();
      if (!c) { return Promise.resolve({ error: { message: 'Supabase not configured' } }); }
      return c.auth.signInWithPassword({ email: email, password: password });
    },
    signOut: function () {
      var c = client();
      return c ? c.auth.signOut() : Promise.resolve();
    },
    getSession: function () {
      var c = client();
      if (!c) { return Promise.resolve(null); }
      return c.auth.getSession().then(function (r) {
        return (r && r.data && r.data.session) ? r.data.session : null;
      });
    }
  };

  /* ---------- articles ---------- */
  var articles = {
    /* public: published only, newest first */
    listPublished: function () {
      var c = client();
      if (!c) { return Promise.resolve([]); }
      return c.from('articles').select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .then(function (r) { return r.data || []; })
        .catch(function () { return []; });
    },
    /* admin: everything */
    listAll: function () {
      var c = client();
      if (!c) { return Promise.resolve([]); }
      return c.from('articles').select('*')
        .order('created_at', { ascending: false })
        .then(function (r) { return r.data || []; });
    },
    getBySlug: function (slug) {
      var c = client();
      if (!c) { return Promise.resolve(null); }
      return c.from('articles').select('*')
        .eq('slug', slug).limit(1)
        .then(function (r) { return (r.data && r.data[0]) || null; })
        .catch(function () { return null; });
    },
    create: function (row) {
      var c = client();
      if (!c) { return Promise.resolve({ error: { message: 'not configured' } }); }
      return c.from('articles').insert(row).select();
    },
    update: function (id, patch) {
      var c = client();
      if (!c) { return Promise.resolve({ error: { message: 'not configured' } }); }
      return c.from('articles').update(patch).eq('id', id).select();
    },
    remove: function (id) {
      var c = client();
      if (!c) { return Promise.resolve({ error: { message: 'not configured' } }); }
      return c.from('articles').delete().eq('id', id);
    }
  };

  /* ---------- storage (thumbnails) ---------- */
  var storage = {
    uploadThumb: function (file, name) {
      var c = client();
      if (!c) { return Promise.resolve({ error: { message: 'not configured' } }); }
      var path = name + '-' + new Date().getTime() + '.' + (file.name.split('.').pop() || 'jpg');
      return c.storage.from('thumbs').upload(path, file, { upsert: true }).then(function (r) {
        if (r.error) { return { error: r.error }; }
        var pub = c.storage.from('thumbs').getPublicUrl(path);
        return { url: (pub && pub.data && pub.data.publicUrl) || null };
      });
    }
  };

  window.WC_DB = {
    configured: configured,
    client: client,
    auth: auth,
    articles: articles,
    storage: storage
  };
})();
