// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "About",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-publications",
          title: "Publications",
          description: "Selected publications and papers.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-projects",
          title: "Projects",
          description: "A growing collection of your cool projects.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "books-the-godfather",
          title: 'The Godfather',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/the_godfather/";
            },},{id: "projects-building-segmentation",
          title: 'Building Segmentation',
          description: "Extracting building coordinates and heights from orthomosaic and DEM data.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/building-segmentation/";
            },},{id: "projects-hex-wife",
          title: 'Hex-Wife',
          description: "Hex-rotor UAV platform for autonomous point-to-point missions.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/hex-wife/";
            },},{id: "projects-no-permission-no-take-off",
          title: 'No Permission, No Take-Off',
          description: "XML signature authentication tool built with OpenSSL.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/npnt/";
            },},{id: "projects-pixtrigger",
          title: 'PixTrigger',
          description: "Camera triggering and geotagging tool for Pixhawk and Raspberry Pi workflows.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/pixtrigger/";
            },},{id: "projects-reinforcement-learning-distillation",
          title: 'Reinforcement Learning Distillation',
          description: "Online knowledge distillation for multi-environment reinforcement learning.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/reinforcement-learning-distillation/";
            },},{id: "projects-splat-by-splat",
          title: 'Splat-by-Splat',
          description: "Progressive Gaussian Splatting for efficient scene reconstruction.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/splat-by-splat/";
            },},{id: "projects-tera",
          title: 'TERA',
          description: "Simulation environment for terrain excavation robot autonomy.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/tera/";
            },},{id: "projects-vtol-uav",
          title: 'VTOL UAV',
          description: "Hybrid vertical take-off and landing UAV built for autonomous navigation.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/vtol-uav/";
            },},{
        id: 'social-cv',
        title: 'CV',
        section: 'Socials',
        handler: () => {
          window.open("/assets/pdf/resume.pdf", "_blank");
        },
      },{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%63%68%72%69%73%74%6F%61@%62%75%66%66%61%6C%6F.%65%64%75", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/christoaluckal", "_blank");
        },
      },{
        id: 'social-linkedin',
        title: 'LinkedIn',
        section: 'Socials',
        handler: () => {
          window.open("https://www.linkedin.com/in/christo-aluckal-765062201", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
