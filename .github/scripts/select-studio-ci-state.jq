[.check_runs[] | select(.name == $check_name and .app.slug == $app_slug)]
| sort_by(.started_at)
| last
| if . == null then
    "missing"
  elif .status != "completed" then
    "pending"
  elif .conclusion == "success" then
    "success"
  else
    "failed:" + (.conclusion // "unknown")
  end
