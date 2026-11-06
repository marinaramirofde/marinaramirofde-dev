export type Technology = {
  name: string;
  logo: string;
  format?: "symbol" | "wide";
};

export const technologies: Technology[] = [
  { name: "Unity", logo: "/technologies/unity.svg" },
  { name: "C#", logo: "/technologies/csharp.svg" },
  { name: "Java", logo: "/technologies/java.svg" },
  { name: "HTML", logo: "/technologies/html.svg" },
  { name: "CSS", logo: "/technologies/css.svg" },
  { name: "JavaScript", logo: "/technologies/javascript.svg" },
  { name: "JSON", logo: "/technologies/json.svg" },
  { name: "GitHub", logo: "/technologies/github.svg" },
  { name: "GitHub Desktop", logo: "/technologies/github-desktop.svg" },
  { name: "Git", logo: "/technologies/git.svg" },
  { name: "Git LFS", logo: "/technologies/git-lfs.svg" },
  { name: "Plastic SCM", logo: "/technologies/plastic-scm.svg" },
  { name: "Visual Studio", logo: "/technologies/visual-studio.svg" },
  { name: "Visual Studio Code", logo: "/technologies/vscode.svg" },
  { name: "Codex", logo: "/technologies/codex.svg" },
  { name: "Jira", logo: "/technologies/jira.svg" },
  { name: "Trello", logo: "/technologies/trello.svg" },
  { name: "Notion", logo: "/technologies/notion.svg" },
  { name: "NikoNiko", logo: "/technologies/nikoniko.svg" },
  { name: "Teams", logo: "/technologies/teams.svg" },
  { name: "DICOM", logo: "/technologies/dicom.svg" },
  { name: "NIfTI", logo: "/technologies/nifti.svg" },
  { name: "openEHR", logo: "/technologies/openehr.svg" },
  { name: "3D Slicer", logo: "/technologies/3d-slicer.png" },
  { name: "OpenXR", logo: "/technologies/openxr.svg", format: "wide" },
  { name: "MRTK", logo: "/technologies/mrtk-official.png", format: "wide" },
  { name: "Meta", logo: "/technologies/meta.svg" },
  { name: "Meta Quest", logo: "/technologies/meta-quest.svg", format: "wide" },
  { name: "HoloLens", logo: "/technologies/hololens-official.png", format: "wide" },
  { name: "Magic Leap", logo: "/technologies/magic-leap.svg", format: "wide" },
  { name: "Blender", logo: "/technologies/blender.svg" },
  { name: "Roblox Studio", logo: "/technologies/roblox-studio.svg" },
  { name: "OBS", logo: "/technologies/obs.svg" },
  { name: "CapCut", logo: "/technologies/capcut.svg", format: "wide" }
];
