---
layout: page
title: Splat-by-Splat
description: Progressive Gaussian Splatting for efficient scene reconstruction.
img: assets/img/projects/splat-results.png
importance: 1
github: https://github.com/christoaluckal/gaussian-splatting
related_publications: false
---

Splat-by-Splat explores progressive Gaussian Splatting for more efficient scene reconstruction. The project focuses on splitting a scene into subsets and incrementally expanding the model instead of treating the reconstruction as a single monolithic optimization problem.

## Highlights

- Progressive reconstruction workflow for Gaussian splatting
- Alternative scene-splitting strategies based on view geometry and clustering
- Practical implementation built on top of the Gaussian Splatting codebase

## Links

- Code: [christoaluckal/gaussian-splatting](https://github.com/christoaluckal/gaussian-splatting)

<div class="row">
  <div class="col-sm-6 mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/projects/split-xyz.png" title="Planar splitting strategy" class="img-fluid rounded z-depth-1" %}
  </div>
  <div class="col-sm-6 mt-3 mt-md-0">
    {% include figure.liquid loading="eager" path="assets/img/projects/split-tree.png" title="KD-tree based splitting strategy" class="img-fluid rounded z-depth-1" %}
  </div>
</div>

<div class="caption">
  Scene partitioning strategies used to create smaller Gaussian subsets for reconstruction.
</div>
