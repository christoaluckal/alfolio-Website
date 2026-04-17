---
layout: page
title: Splat-by-Splat
description: Progressive Gaussian Splatting for efficient scene reconstruction.
img: assets/img/projects/splat-by-splat.jpg
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
- Abstract: [Project abstract](/assets/pdf/splat.pdf)

## Results

{% include figure.liquid loading="eager" path="assets/img/projects/splat-results.png" title="Scene reconstruction results" class="img-fluid rounded z-depth-1" %}

## How To Run

### Installation

```bash
git clone https://github.com/christoaluckal/gaussian-splatting.git --recursive
cd gaussian-splatting

conda env create --file environment.yml
conda activate gaussian_splatting
```

### Running The Code

```bash
python colmap_splitter/split.py \
  -s original_COLMAP_txt_scene \
  -m output_folder \
  -f frame_name \
  --num_test number_of_test_images
```

```bash
python train.py \
  -s output_folder/model0 \
  -m output_name \
  -r resolution_fraction \
  --eval \
  --pkl_name output_pkl_name \
  -x 1 \
  --splitter_itr iteration_value
```

The trained Gaussian model and reconstruction results are written to the `output/` directory.

## Additional Splitting Strategies

### Split By Cartesian Plane

A plane defined using the viewport positions can be used to split the model. See [`colmap_splitter/split_xyz.py`](https://github.com/christoaluckal/gaussian-splatting/blob/main/colmap_splitter/split_xyz.py).

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
