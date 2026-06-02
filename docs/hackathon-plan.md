# MedLens AI Hackathon Plan

## Problem

Medical reports and lab results often contain complex terminology that patients do not understand.

## Solution

MedLens AI allows users to upload a medical report and receive:

- Plain-language explanations
- Important findings summaries
- Medical terminology translations
- Suggested questions for healthcare providers

## MVP Features

- PDF upload
- Text extraction
- AI-generated summary
- Key findings section
- Suggested doctor questions

## Stretch Features

- Medical term dictionary
- Multi-language support
- Risk highlighting
- Historical report comparison

## Tech Stack

### Frontend
- React
- Tailwind CSS

### Backend
- FastAPI
- Python

### AI
- OpenAI API

### PDF Processing
- pdfplumber

## Demo Flow

1. Upload medical report
2. Extract report text
3. Generate AI explanation
4. Display patient-friendly summary
5. Display suggested questions

## Target Users

- Patients
- Caregivers
- Family members