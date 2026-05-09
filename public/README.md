# SPL Election Portal - Database Structure

## Overview
This directory contains the SPL Election Portal files with a database-driven approach for candidate information.

## File Structure

### Database Files
- `candidates.json` - Contains candidate information including name, tagline, class, section, gender, and file references

### Image Assets
- `images/portraits/` - Contains candidate portrait files (boy.png, girl.png)
- `images/symbols/` - Contains candidate symbols sprite (symbols.png)

### Candidate Data Format
Each candidate in `candidates.json` includes:
- `id`: Unique identifier
- `name`: Candidate name
- `tagline`: Candidate tagline/slogan
- `class`: Class (XI, XII, etc.)
- `section`: Section (A, B, C, D, etc.)
- `gender`: Gender (male/female) - determines which portrait to use
- `portraitFile`: Portrait filename (boy.png or girl.png)
- `symbolIndex`: Index (0-7) for symbol positioning in symbols.png sprite

## Required Image Files

### Portraits (images/portraits/)
- `boy.png` - Portrait for male candidates (118x118px recommended)
- `girl.png` - Portrait for female candidates (118x118px recommended)

### Symbols (images/symbols/)
- `symbols.png` - Sprite containing all 8 symbols (208x104px, 2 rows of 4 symbols each)
  - Each symbol: 52x52px
  - Symbol mapping:
    - Index 0: Phoenix (Manjit)
    - Index 1: Compass (Harsha)
    - Index 2: Balance Scale (Suchir)
    - Index 3: Lighthouse (Hari)
    - Index 4: Puzzle Heart (Riya)
    - Index 5: Gear with Lightbulb (Tamil)
    - Index 6: Kite (Vijay)
    - Index 7: Hand with Star (Virat)

## Image Specifications
- **Portraits**: 118x118px PNG files, circular format recommended
- **Symbols Sprite**: 208x104px PNG file with 8 symbols arranged in 2x4 grid

## Usage
The system automatically loads candidate data from `candidates.json` when the page loads. Portraits are selected based on gender (boy.png/girl.png), and symbols are positioned using CSS background-position from the symbols.png sprite.
