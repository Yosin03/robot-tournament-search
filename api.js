// API Configuration
const apiurl = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') 
  ? 'http://localhost:4000' 
  : 'https://roboturnir.ru';

// Utility function for password hashing
async function digest(data, algorithm = 'SHA-256') {
  const ec = new TextEncoder();
  const digest = await window.crypto.subtle.digest(algorithm, ec.encode(data));
  let ret = btoa(String.fromCharCode.apply(null, new Uint8Array(digest)));
  return ret;
}

// Date processing utility function
const processDateFields = (tournament) => {
  // Tournament register end date
  if (tournament.tournament_register_end) {
    tournament.tournament_register_end = new Date(tournament.tournament_register_end);
    tournament.tournament_register_end_left = tournament.tournament_register_end - new Date();
    tournament.tournament_register_end_str = tournament.tournament_register_end.toLocaleString();
  } else {
    tournament.tournament_register_end_str = 'Не указано';
    tournament.tournament_register_end_left = 0;
  }

  // Tournament register start date
  if (tournament.tournament_register_start) {
    tournament.tournament_register_start = new Date(tournament.tournament_register_start);
    tournament.tournament_register_start_left = tournament.tournament_register_start - new Date();
  } else {
    tournament.tournament_register_start_left = 0;
  }

  // Tournament start date
  if (tournament.tournament_start) {
    tournament.tournament_start = new Date(tournament.tournament_start);
    tournament.tournament_start_left = Math.ceil((tournament.tournament_start - new Date()) / (1000 * 60 * 60));
    tournament.tournament_start_str = tournament.tournament_start.toLocaleDateString(navigator.languages[0], {
      weekday: "long",
      year: tournament.tournament_start.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
      month: "short",
      day: "numeric"
    });
  } else {
    tournament.tournament_start_str = 'Дата не назначена';
    tournament.tournament_start_left = 0;
  }

  // Tournament end date
  if (tournament.tournament_end) {
    tournament.tournament_end = new Date(tournament.tournament_end);
    tournament.tournament_end_str = tournament.tournament_end.toLocaleDateString(navigator.languages[0], {
      weekday: "long",
      year: tournament.tournament_end.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
      month: "short",
      day: "numeric"
    });
  } else {
    tournament.tournament_end_str = 'Дата не назначена';
  }

  // Format tournament date string
  if (tournament.tournament_start) {
    tournament.tournament_date_str = tournament.tournament_start.toLocaleDateString(navigator.languages[0], {
      year: tournament.tournament_start.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
      month: "short",
      day: "numeric"
    });
    
    if (tournament.tournament_end && tournament.tournament_start_str !== tournament.tournament_end_str) {
      tournament.tournament_date_str += '-' + tournament.tournament_end.toLocaleDateString(navigator.languages[0], {
        year: tournament.tournament_end.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
        month: "short",
        day: "numeric"
      });
    }
  } else {
    tournament.tournament_date_str = 'Дата не назначена';
  }

  // Calculate tournament state
  if (tournament.tournament_state === 0) {
    if (tournament.tournament_end && new Date() > tournament.tournament_end) {
      tournament.tournament_state = 5; // finished
    } else if (tournament.tournament_start && new Date() >= tournament.tournament_start) {
      tournament.tournament_state = 4; // in progress
    } else if (tournament.tournament_register_end && new Date() > tournament.tournament_register_end) {
      tournament.tournament_state = 3; // registration is over
    } else if (tournament.tournament_register_start && new Date() >= tournament.tournament_register_start) {
      tournament.tournament_state = 2; // registration in progress
    } else {
      tournament.tournament_state = 1; // awaiting for registration
    }
  }

  return tournament;
};

// Main API object
const api = {
  url: apiurl
};

// ====================
// TOURNAMENT FUNCTIONS
// ====================

api.get_tournaments = async () => {
  try {
    console.log('🔍 Getting tournaments from:', apiurl + '/api/tournaments');
    const response = await fetch(apiurl + '/api/tournaments', { credentials: "include" });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let res = await response.json();
    console.log('✅ Got tournaments:', res.length, res);

    // Process dates for each tournament
    for (let j = 0; j < res.length; j++) {
      res[j] = processDateFields(res[j]);
    }

    return res;
  } catch (err) {
    console.error('❌ Error getting tournaments:', err);
    return [];
  }
};

api.get_featured_tournaments = async () => {
  try {
    console.log('🔍 Getting featured tournaments from:', apiurl + '/api/tournaments/featured');
    const response = await fetch(apiurl + '/api/tournaments/featured', { credentials: "include" });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let res = await response.json();
    console.log('✅ Got featured tournaments:', res.length, res);

    // Process dates for each tournament
    for (let j = 0; j < res.length; j++) {
      res[j] = processDateFields(res[j]);
    }

    return res;
  } catch (err) {
    console.error('❌ Error getting featured tournaments:', err);
    return [];
  }
};

api.get_all_tournaments = async () => {
  try {
    console.log('🔍 Getting all tournaments from:', apiurl + '/api/tournaments/all');
    const response = await fetch(apiurl + '/api/tournaments/all', { credentials: "include" });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let res = await response.json();
    console.log('✅ Got all tournaments:', res.length, res);

    // Process dates for each tournament
    for (let j = 0; j < res.length; j++) {
      res[j] = processDateFields(res[j]);
    }

    return res;
  } catch (err) {
    console.error('❌ Error getting all tournaments:', err);
    return [];
  }
};

api.get_tournament = async (id) => {
  try {
    const response = await fetch(apiurl + '/api/tournaments/' + id, { credentials: "include" });
    let res = await response.json();
    return res;
  } catch (err) {
    console.error('❌ Error getting tournament:', err);
    return null;
  }
};

api.create_tournament = async (tournament) => {
  try {
    const response = await fetch(apiurl + '/api/tournaments', {
      credentials: "include",
      method: 'POST',
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(tournament)
    });
    const response2 = await response.json();
    return response2;
  } catch (err) {
    console.error('❌ Error creating tournament:', err);
    throw err;
  }
};

api.update_tournament = async (tournament_id, tournament) => {
  try {
    const response = await fetch(apiurl + '/api/tournaments' + (tournament_id !== '-' ? '/' + tournament_id : ''), {
      credentials: "include",
      method: tournament_id !== '-' ? 'PUT' : 'POST',
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tournament)
    });
    const response2 = await response.json();
    return response2;
  } catch (err) {
    console.error('❌ Error updating tournament:', err);
    throw err;
  }
};

api.toggle_tournament_featured = async (tournament_id, featured) => {
  try {
    const response = await fetch(apiurl + '/api/tournaments/' + tournament_id + '/featured', {
      credentials: "include",
      method: 'PUT',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ featured: featured })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Tournament featured status updated:', result);
    return result;
  } catch (err) {
    console.error('❌ Error updating featured status:', err);
    throw err;
  }
};

// ====================
// SEARCH FUNCTIONS
// ====================

api.search_tournaments = async (query) => {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }
    
    console.log('🔍 Searching tournaments:', query);
    const response = await fetch(
      apiurl + '/api/search/tournaments?' + new URLSearchParams({ q: query }).toString(),
      {
        credentials: "include",
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const results = await response.json();
    console.log('✅ Tournament search results:', results.length);
    return results;
  } catch (err) {
    console.error('❌ Tournament search error:', err);
    return [];
  }
};

api.search_robots = async (query) => {
  try {
    console.log('🤖 Searching robots for:', query);
    const response = await fetch(apiurl + `/api/search/robots?q=${encodeURIComponent(query)}`, {
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let res = await response.json();
    console.log('✅ Got robots:', res?.length || 0);
    return res || [];
  } catch (err) {
    console.error('❌ Error searching robots:', err);
    return [];
  }
};

api.search_users = async (query) => {
  try {
    console.log('👤 Searching users for:', query);
    const response = await fetch(apiurl + `/api/search/users?q=${encodeURIComponent(query)}`, {
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let res = await response.json();
    console.log('✅ Got users:', res?.length || 0);
    return res || [];
  } catch (err) {
    console.error('❌ Error searching users:', err);
    return [];
  }
};

api.search_teams = async (query) => {
  try {
    console.log('👥 Searching teams for:', query);
    const response = await fetch(apiurl + `/api/search/teams?q=${encodeURIComponent(query)}`, {
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let res = await response.json();
    console.log('✅ Got teams:', res?.length || 0);
    return res || [];
  } catch (err) {
    console.error('❌ Error searching teams:', err);
    return [];
  }
};

api.search_all = async (query) => {
  try {
    console.log('🔍 Universal search for:', query);
    const response = await fetch(apiurl + `/api/search/all?q=${encodeURIComponent(query)}`, {
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let res = await response.json();
    console.log('✅ Got universal search results:', res);
    return res || {
      tournaments: [],
      robots: [],
      users: [],
      teams: []
    };
  } catch (err) {
    console.error('❌ Error in universal search:', err);
    return {
      tournaments: [],
      robots: [],
      users: [],
      teams: []
    };
  }
};

// ====================
// USER FUNCTIONS
// ====================

api.testlogin = async (user_id) => {
  try {
    const response = await fetch(apiurl + '/api/test?' + new URLSearchParams({ user_id }).toString(), {
      credentials: "include",
      method: 'GET',
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const response2 = await response.json();
    if (!response2.user_id) throw new Error("lost login");
    return response2;
  } catch (err) {
    console.error('❌ Test login error:', err);
    throw err;
  }
};

api.get_user = async (user_id) => {
  try {
    const response = await fetch(apiurl + '/api/users/' + user_id, {
      headers: { 'Content-Type': 'application/json' },
      credentials: "include"
    });
    const response2 = await response.json();
    return response2;
  } catch (err) {
    console.error('❌ Error getting user:', err);
    throw err;
  }
};

api.update_user = async (user_id, user) => {
  try {
    const response = await fetch(apiurl + '/api/users/' + user_id, {
      credentials: "include",
      method: 'PUT',
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user)
    });
    const response2 = await response.json();
    return response2;
  } catch (err) {
    console.error('❌ Error updating user:', err);
    throw err;
  }
};

api.update_userpassword = async (user_id, user_login, old_password, new_password) => {
  try {
    const response = await fetch(apiurl + `/api/users/${user_id}/passwd`, {
      credentials: "include",
      method: 'PUT',
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id,
        user_login,
        old_password: await digest(user_login + ':' + old_password),
        new_password: await digest(user_login + ':' + new_password)
      })
    });
    const response2 = await response.json();
    return response.status === 200;
  } catch (err) {
    console.error('❌ Error updating password:', err);
    return false;
  }
};

api.confirm_user_email = async (user_id, token) => {
  try {
    const response = await fetch(apiurl + '/api/users/' + user_id + '/conf?' + new URLSearchParams({ confirm: token }).toString(), {
      headers: { 'Content-Type': 'application/json' },
      credentials: "include"
    });
    if (!response.ok) throw new Error('Server error');
    const response2 = await response.json();
    return response2;
  } catch (err) {
    console.error('❌ Error confirming email:', err);
    throw err;
  }
};

api.send_new_confirm_user_email = async (user_id) => {
  try {
    const response = await fetch(apiurl + '/api/users/' + user_id + '/sendconfemail', {
      headers: { 'Content-Type': 'application/json' },
      credentials: "include"
    });
    const response2 = await response.json();
    return response2;
  } catch (err) {
    console.error('❌ Error sending confirmation email:', err);
    throw err;
  }
};

api.deleteUser = async (user_id) => {
  try {
    console.log('🗑️ Deleting user:', user_id);
    const response = await fetch(apiurl + '/api/users/' + user_id, {
      credentials: "include",
      method: 'DELETE',
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id })
    });
    const response2 = await response.json();
    return response2;
  } catch (err) {
    console.error('❌ Error deleting user:', err);
    return null;
  }
};

// ====================
// ROBOT FUNCTIONS
// ====================

api.getrobotData = async (robot_id) => {
  try {
    const response = await fetch(apiurl + '/api/robots/' + robot_id, {
      headers: { 'Content-Type': 'application/json' },
      credentials: "include"
    });
    const response2 = await response.json();
    return response2;
  } catch (err) {
    console.error('❌ Error getting robot data:', err);
    throw err;
  }
};

api.updateRobot = async (robot_id, data) => {
  try {
    const response = await fetch(apiurl + '/api/robots/' + robot_id, {
      credentials: "include",
      method: 'PUT',
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    });
    const response2 = await response.json();
    return response2;
  } catch (err) {
    console.error('❌ Error updating robot:', err);
    throw err;
  }
};

api.moveRobot = async (robot_id, data) => {
  try {
    const response = await fetch(apiurl + '/api/robots/' + robot_id + '/move', {
      credentials: "include",
      method: 'PUT',
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    });
    const response2 = await response.json();
    return response2;
  } catch (err) {
    console.error('❌ Error moving robot:', err);
    throw err;
  }
};

api.deleteRobot = async (robot_id) => {
  try {
    const response = await fetch(apiurl + '/api/robots/' + robot_id, {
      credentials: "include",
      method: 'DELETE',
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ robot_id })
    });
    const response2 = await response.json();
    return response2;
  } catch (err) {
    console.error('❌ Error deleting robot:', err);
    throw err;
  }
};

// ====================
// UTILITY FUNCTIONS
// ====================

api.fetch_users = async (name) => {
  try {
    const response = await fetch(apiurl + '/api/userssearch?' + new URLSearchParams({ name: name }).toString(), {
      credentials: "include",
      method: 'GET',
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const response2 = await response.json();
    return response2;
  } catch (err) {
    console.error('❌ Error fetching users:', err);
    throw err;
  }
};

api.fetch_users_robots = async (name) => {
  try {
    const response = await fetch(apiurl + '/api/userrobotssearch?' + new URLSearchParams({ name: name }).toString(), {
      credentials: "include",
      method: 'GET',
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const response2 = await response.json();
    return response2;
  } catch (err) {
    console.error('❌ Error fetching user robots:', err);
    throw err;
  }
};

// ====================
// FILE UPLOAD FUNCTIONS
// ====================

api.uploadPicture = (file, id) => {
  return new Promise((resolve, reject) => {
    let formData = new FormData();
    formData.append("file", file);
    
    if (id.robot_id) {
      formData.append("robot_id", id.robot_id);
    } else if (id.user_id) {
      formData.append("user_id", id.user_id);
    } else if (id.tournament_id) {
      formData.append("tournament_id", id.tournament_id);
    } else if (id.tournament_doc_id) {
      formData.append("tournament_doc_id", id.tournament_doc_id);
    } else if (id.supertour_id) {
      formData.append("supertour_id", id.supertour_id);
    }

    let request = new XMLHttpRequest();
    request.withCredentials = true;
    request.open('POST', apiurl + '/api/upload');
    
    request.upload.addEventListener('progress', function (e) {
      let percent_completed = (e.loaded / e.total) * 100;
      console.log('Upload progress:', percent_completed + '%');
    });
    
    request.addEventListener('load', function (e) {
      if (request.status !== 200) {
        reject(new Error(`Ошибка ${request.status}: ${request.statusText}`));
      } else {
        resolve(JSON.parse(request.response));
      }
    });
    
    request.send(formData);
  });
};

api.deleteFile = async (doc_id) => {
  try {
    const response = await fetch(apiurl + '/api/upload/' + doc_id, {
      credentials: "include",
      method: 'DELETE',
      cache: "no-cache",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doc_id })
    });
    const response2 = await response.json();
    return response2;
  } catch (err) {
    console.error('❌ Error deleting file:', err);
    throw err;
  }
};

// ====================
// SUPERTOUR FUNCTIONS
// ====================

api.get_supertour = async (id) => {
  try {
    const response = await fetch(apiurl + '/api/supertour/' + id, { credentials: "include" });
    let res = await response.json();
    return res;
  } catch (err) {
    console.error('❌ Error getting supertour:', err);
    throw err;
  }
};

api.get_supertourbots = async (id) => {
  try {
    const response = await fetch(apiurl + '/api/supertour/' + id + '/bots', { credentials: "include" });
    let res = await response.json();
    return res;
  } catch (err) {
    console.error('❌ Error getting supertour bots:', err);
    throw err;
  }
};

api.get_supertourteams = async (id) => {
  try {
    const response = await fetch(apiurl + '/api/supertour/' + id + '/teams', { credentials: "include" });
    let res = await response.json();
    return res;
  } catch (err) {
    console.error('❌ Error getting supertour teams:', err);
    throw err;
  }
};

api.update_supertour = async (tournament_id, tournament) => {
  try {
    const response = await fetch(apiurl + '/api/supertour' + (tournament_id !== '-' ? '/' + tournament_id : ''), {
      credentials: "include",
      method: tournament_id !== '-' ? 'PUT' : 'POST',
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tournament)
    });
    const response2 = await response.json();
    return response2;
  } catch (err) {
    console.error('❌ Error updating supertour:', err);
    throw err;
  }
};

api.supertour_recalcstat = async (supertour_id) => {
  try {
    const response = await fetch(apiurl + '/api/supertour/' + supertour_id + '/recalc', {
      credentials: "include",
      method: 'GET',
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const response2 = await response.json();
    return response2;
  } catch (err) {
    console.error('❌ Error recalculating supertour stats:', err);
    throw err;
  }
};

// ====================
// TOURNAMENT MANAGEMENT
// ====================

api.tournament_add_parts = async (tournament_id, parts) => {
  try {
    const response = await fetch(apiurl + '/api/tournaments/' + tournament_id + '/addexistparts', {
      credentials: "include",
      method: 'POST',
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parts)
    });
    const response2 = await response.json();
    return response2;
  } catch (err) {
    console.error('❌ Error adding tournament parts:', err);
    throw err;
  }
};

api.tournament_add_fight = async (tournament_id, first, second) => {
  try {
    const response = await fetch(apiurl + '/api/tournaments/' + tournament_id + '/addfight', {
      credentials: "include",
      method: 'POST',
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ first, second })
    });
    const response2 = await response.json();
    return response2;
  } catch (err) {
    console.error('❌ Error adding tournament fight:', err);
    throw err;
  }
};

api.tournament_recalcstat = async (tournament_id) => {
  try {
    const response = await fetch(apiurl + '/api/tournaments/' + tournament_id + '/recalc', {
      credentials: "include",
      method: 'GET',
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const response2 = await response.json();
    return response2;
  } catch (err) {
    console.error('❌ Error recalculating tournament stats:', err);
    throw err;
  }
};

api.setapproval = async (tournament_id, participant_id, approval) => {
  try {
    const response = await fetch(apiurl + '/api/tournaments/' + tournament_id + '/approval', {
      credentials: "include",
      method: 'PUT',
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tournament_id, participant_id: participant_id, participant_approval: approval })
    });
    const response2 = await response.json();
    return response2;
  } catch (err) {
    console.error('❌ Error setting approval:', err);
    throw err;
  }
};

// ====================
// FIGHT FUNCTIONS
// ====================

api.setfightres = async (id, part, fight_result_state, other_fight_result_state) => {
  try {
    const response = await fetch(apiurl + '/api/fights/' + id, {
      credentials: "include",
      method: 'POST',
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fight_id: id,
        fight_result_position: part,
        fight_result_state: fight_result_state,
        other_fight_result_state: other_fight_result_state
      })
    });
    const response2 = await response.json();
    return response2;
  } catch (err) {
    console.error('❌ Error setting fight result:', err);
    throw err;
  }
};

api.setfightscore = async (id, part, val) => {
  try {
    const response = await fetch(apiurl + '/api/fights/' + id, {
      credentials: "include",
      method: 'POST',
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fight_id: id,
        fight_result_position: part,
        fight_result_score: val,
      })
    });
    const response2 = await response.json();
    return response2;
  } catch (err) {
    console.error('❌ Error setting fight score:', err);
    throw err;
  }
};

api.setfight = async (id, stat) => {
  try {
    const response = await fetch(apiurl + '/api/fights/' + id, {
      credentials: "include",
      method: 'POST',
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fight_id: id,
        fight_state: stat,
      })
    });
    const response2 = await response.json();
    return response2;
  } catch (err) {
    console.error('❌ Error setting fight:', err);
    throw err;
  }
};

api.savefight = async (id, data) => {
  try {
    const response = await fetch(apiurl + '/api/fightsedit/' + id, {
      credentials: "include",
      method: 'POST',
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fight_id: id,
        fight_data: data,
      })
    });
    const response2 = await response.json();
    return response2;
  } catch (err) {
    console.error('❌ Error saving fight:', err);
    throw err;
  }
};

// ====================
// MEDIA FUNCTIONS
// ====================

api.editmedia = async (id, media) => {
  try {
    const response = await fetch(apiurl + '/api/mediaedit/' + id, {
      credentials: "include",
      method: 'POST',
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(media)
    });
    const response2 = await response.json();
    return response2;
  } catch (err) {
    console.error('❌ Error editing media:', err);
    throw err;
  }
};

api.deletemedia = async (id) => {
  try {
    const response = await fetch(apiurl + '/api/mediaedit/' + id, {
      credentials: "include",
      method: 'DELETE',
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(id)
    });
    const response2 = await response.json();
    return response2;
  } catch (err) {
    console.error('❌ Error deleting media:', err);
    throw err;
  }
};

export default api;