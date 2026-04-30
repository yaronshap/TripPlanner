# TripPlanner

Interactive road-trip planner for all 48 contiguous U.S. states.

## Live App

[Open the TripPlanner app](https://yaronshap.github.io/TripPlanner/)

## GitHub Pages

The published site lives in [`docs/index.html`](docs/index.html). Once this repository is pushed to GitHub:

1. Open the repository on GitHub.
2. Go to `Settings` -> `Pages`.
3. Set `Source` to `Deploy from a branch`.
4. Choose branch `main` and folder `/docs`.

GitHub Pages will then publish the planner at:

`https://yaronshap.github.io/TripPlanner/`

## Local rebuild

Run:

```powershell
& 'C:\Users\yaron.shaposhnik\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' build_roadtrip_attractions.mjs
```

That regenerates:

- `docs/index.html`
- `docs/northern_states_roadtrip_map.html`
- `docs/northern_states_roadtrip_attractions.xlsx`
