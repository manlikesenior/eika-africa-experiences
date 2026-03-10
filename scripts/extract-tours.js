/**
 * Script to extract tours from Africa Safari Trips and store in Supabase
 * Usage: node scripts/extract-tours.js
 */

import * as cheerio from 'cheerio';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs/promises';

const SUPABASE_URL = "https://uxdiipqxujzbzfizbhic.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "REDACTED_KEY";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const tourUrls = [
  'https://africasafaritrips.com/itineraries/9-day-uganda-gorillas-chimpanzees/',
  'https://africasafaritrips.com/itineraries/10-days-uganda-safari-among-rhinos-forests-and-lakes/',
  'https://africasafaritrips.com/itineraries/16-days-uganda-all-pearls/',
  'https://africasafaritrips.com/itineraries/13-days-uganda-hiking-rafting-and-biking-adventure/',
  'https://africasafaritrips.com/itineraries/11-day-uganda-a-cultural-experience/',
  'https://africasafaritrips.com/itineraries/7-day-uganda-the-perfect-family-program/'
];

// Helper function to create slug from title
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Extract tour data from HTML
async function extractTourData(url) {
  console.log(`\nFetching: ${url}`);
  
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const tour = {};
    
    // Extract basic info
    const mainHeading = $('h1').first().text().trim();
    tour.title = mainHeading;
    tour.slug = createSlug(mainHeading);
    
    // Extract subtitle/description from h2 below price
    const subtitle = $('h2').first().text().trim();
    if (subtitle) {
      tour.description = subtitle;
    }
    
    // Extract duration from heading (e.g., "9 DAYS")
    const durationMatch = mainHeading.match(/(\d+)[- ]DAY/i);
    if (durationMatch) {
      tour.duration = `${durationMatch[1]} days`;
    }
    
    // Extract base price (6 persons low season)
    let basePrice = null;
    $('.pricing-card, .price-table').each((i, elem) => {
      const text = $(elem).text();
      const lowSeasonMatch = text.match(/6 persons[^$]*\$([0-9,]+(?:\.[0-9]+)?)/i);
      if (lowSeasonMatch) {
        basePrice = parseFloat(lowSeasonMatch[1].replace(/,/g, ''));
        return false;
      }
    });
    
    // Fallback: look in main content
    if (!basePrice) {
      const priceText = $('.price-note, .pricing-info, h2').text();
      const priceMatch = priceText.match(/FROM \$([0-9,]+)/i);
      if (priceMatch) {
        basePrice = parseFloat(priceMatch[1].replace(/,/g, ''));
      }
    }
    
    tour.price = basePrice;
    tour.price_note = "price p.p. incl. guide, safari jeep, hotel and park entrance fees, excl. international flight (based on six persons)";
    
    // Extract overview from first paragraph
    const overviewPara = $('p').filter((i, elem) => {
      const text = $(elem).text();
      return text.length > 100 && !text.includes('Cookie');
    }).first().text().trim();
    tour.overview = overviewPara;
    
    // Extract destinations
    tour.destinations = ['Uganda'];
    
    // Extract highlights
    const highlights = [];
    $('ul li, .highlights li').each((i, elem) => {
      const text = $(elem).text().trim();
      if (text && text.length > 10 && text.length < 200 && !text.includes('http')) {
        highlights.push(text);
      }
    });
    tour.highlights = highlights.slice(0, 8);
    
    // Extract inclusions
    const inclusions = [];
    $('[class*="include"] li, .included li').each((i, elem) => {
      const text = $(elem).text().trim();
      if (text && text.length > 2) {
        inclusions.push(text);
      }
    });
    
    // Fallback inclusions if none found
    if (inclusions.length === 0) {
      inclusions.push("24/7 service");
      inclusions.push("All accommodations included");
      inclusions.push("Drinking water in safari jeeps");
      inclusions.push("Full board (meals)");
      inclusions.push("Game drives");
      inclusions.push("Luxurious private 4×4 Safari Jeep");
      inclusions.push("Park entrance fees");
      inclusions.push("Private guide speaking fluently English");
      inclusions.push("Reservation costs");
      inclusions.push("Fully accredited under SGR");
    }
    tour.inclusions = inclusions;
    
    // Extract exclusions
    const exclusions = [];
    $('[class*="exclude"] li, .excluded li').each((i, elem) => {
      const text = $(elem).text().trim();
      if (text && text.length > 2) {
        exclusions.push(text);
      }
    });
    
    // Fallback exclusions
    if (exclusions.length === 0) {
      exclusions.push("Visas");
      exclusions.push("Travel insurance");
      exclusions.push("International flights (can be booked on request)");
    }
    tour.exclusions = exclusions;
    
    // Extract itinerary
    const itinerary = [];
    $('[class*="day"], .itinerary-day, h4:contains("DAY")').each((i, elem) => {
      const dayElem = $(elem);
      const dayText = dayElem.text();
      const dayMatch = dayText.match(/DAY (\d+)/i);
      
      if (dayMatch) {
        const dayNum = parseInt(dayMatch[1]);
        const title = dayElem.next('h2, h3, h4, p').text().trim() || dayText.replace(/DAY \d+:?\s*/i, '');
        const description = dayElem.nextAll('p').first().text().trim();
        
        if (title) {
          itinerary.push({
            day: dayNum,
            title: title.replace(/DAY \d+:?\s*/i, ''),
            description: description || '',
            activities: []
          });
        }
      }
    });
    
    tour.itinerary = itinerary.length > 0 ? itinerary : null;
    
    // Extract main image
    const mainImage = $('img').filter((i, elem) => {
      const src = $(elem).attr('src');
      return src && !src.includes('logo') && !src.includes('icon') && src.includes('http');
    }).first().attr('src');
    
    tour.image_url = mainImage || null;
    
    // Extract gallery images
    const gallery = [];
    $('img').each((i, elem) => {
      const src = $(elem).attr('src');
      if (src && !src.includes('logo') && !src.includes('icon') && src.includes('http') && src !== mainImage) {
        gallery.push(src);
      }
    });
    tour.gallery = gallery.slice(0, 10);
    
    tour.is_featured = false;
    tour.is_published = true;
    
    return tour;
  } catch (error) {
    console.error(`Error extracting ${url}:`, error.message);
    return null;
  }
}

// Download image and upload to Supabase storage
async function uploadImageToStorage(imageUrl, tourSlug, index = 0) {
  try {
    console.log(`  Downloading image: ${imageUrl}`);
    
    // Download image
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    // Determine file extension
    const contentType = response.headers['content-type'];
    let ext = 'jpg';
    if (contentType.includes('png')) ext = 'png';
    else if (contentType.includes('webp')) ext = 'webp';
    
    // Create filename
    const filename = `${tourSlug}-${index}.${ext}`;
    const filepath = `tours/${filename}`;
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('tour-images')
      .upload(filepath, response.data, {
        contentType: contentType,
        upsert: true
      });
    
    if (error) {
      console.error(`  Error uploading image:`, error.message);
      return imageUrl; // Return original URL as fallback
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('tour-images')
      .getPublicUrl(filepath);
    
    console.log(`  Uploaded: ${filename}`);
    return publicUrl;
  } catch (error) {
    console.error(`  Error processing image:`, error.message);
    return imageUrl; // Return original URL as fallback
  }
}

// Main execution
async function main() {
  console.log('=== Tour Extraction Started ===\n');
  
  // Ensure storage bucket exists
  console.log('Checking storage bucket...');
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === 'tour-images');
  
  if (!bucketExists) {
    console.log('Creating tour-images bucket...');
    const { error } = await supabase.storage.createBucket('tour-images', {
      public: true,
      fileSizeLimit: 5242880 // 5MB
    });
    
    if (error) {
      console.error('Error creating bucket:', error);
      return;
    }
  }
  
  const extractedTours = [];
  
  // Extract all tours
  for (const url of tourUrls) {
    const tourData = await extractTourData(url);
    if (tourData) {
      extractedTours.push(tourData);
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log(`\n=== Extracted ${extractedTours.length} tours ===\n`);
  
  // Upload images and insert tours
  for (const tour of extractedTours) {
    console.log(`\nProcessing tour: ${tour.title}`);
    
    // Upload main image
    if (tour.image_url) {
      tour.image_url = await uploadImageToStorage(tour.image_url, tour.slug, 0);
    }
    
    // Upload gallery images
    if (tour.gallery && tour.gallery.length > 0) {
      const uploadedGallery = [];
      for (let i = 0; i < Math.min(tour.gallery.length, 5); i++) {
        const publicUrl = await uploadImageToStorage(tour.gallery[i], tour.slug, i + 1);
        uploadedGallery.push(publicUrl);
      }
      tour.gallery = uploadedGallery;
    }
    
    // Insert into database
    console.log(`  Inserting into database...`);
    const { data, error } = await supabase
      .from('tours')
      .upsert(tour, { onConflict: 'slug' })
      .select();
    
    if (error) {
      console.error(`  Error inserting tour:`, error.message);
    } else {
      console.log(`  ✓ Successfully inserted: ${tour.title}`);
    }
  }
  
  console.log('\n=== Tour Extraction Complete ===');
}

main().catch(console.error);
