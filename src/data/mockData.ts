
import { Product } from '@/stores/useCartStore';

const heroImage = '/assets/generated_images/automotive_turbocharger_hero_banner.png';
const turboImage = '/assets/generated_images/turbocharger_product_shot.png';
const intercoolerImage = '/assets/generated_images/intercooler_product_shot.png';
const brakeImage = '/assets/generated_images/brake_kit_product_shot.png';

export const categories = [
  { id: '1', name: 'Turbochargers', slug: 'turbochargers', image: turboImage },
  { id: '2', name: 'Cooling', slug: 'cooling', image: intercoolerImage },
  { id: '3', name: 'Exhaust', slug: 'exhaust', image: turboImage }, // Placeholder
  { id: '4', name: 'Electronics', slug: 'electronics', image: turboImage }, // Placeholder
  { id: '5', name: 'Brakes', slug: 'brakes', image: brakeImage },
  { id: '6', name: 'Suspension', slug: 'suspension', image: turboImage }, // Placeholder
];

export const brands = [
  { id: '1', name: 'Garrett', slug: 'garrett' },
  { id: '2', name: 'BorgWarner', slug: 'borgwarner' },
  { id: '3', name: 'Precision Turbo', slug: 'precision-turbo' },
  { id: '4', name: 'HKS', slug: 'hks' },
  { id: '5', name: 'GReddy', slug: 'greddy' },
];

export const products: Product[] = [
  {
    id: '1',
    sku: 'TRB-GTX3582R',
    name: 'Garrett GTX3582R Gen II Turbocharger',
    slug: 'garrett-gtx3582r-gen-ii',
    price: 2450.00,
    image: turboImage,
    category: 'turbochargers',
    brand: 'Garrett',
    stock: 5,
    description: 'The GTX3582R Gen II is a high-performance turbocharger capable of supporting up to 850 horsepower. Features a forged milled compressor wheel and dual ceramic ball bearings.',
    specs: {
      'Horsepower Rating': '450 - 850 HP',
      'Compressor Wheel Inducer': '66mm',
      'Compressor Wheel Exducer': '82mm',
      'Turbine Wheel Inducer': '68mm',
      'Turbine Wheel Exducer': '62mm',
    },
    fitment: ['Universal', 'Nissan RB26DETT', 'Toyota 2JZ-GTE'],
    isNew: true,
    isBestSeller: true,
  },
  {
    id: '2',
    sku: 'IC-UNI-600',
    name: 'KSR 600x300x76mm Front Mount Intercooler',
    slug: 'ksr-intercooler-600',
    price: 350.00,
    image: intercoolerImage,
    category: 'cooling',
    brand: 'KSR',
    stock: 20,
    description: 'High efficiency bar and plate intercooler core. Polished aluminum end tanks. Supports up to 600HP.',
    specs: {
      'Core Size': '600mm x 300mm x 76mm',
      'Inlet/Outlet': '3 inch (76mm)',
      'Material': 'Aluminum',
      'Construction': 'Bar and Plate',
    },
    fitment: ['Universal'],
    isNew: false,
    isBestSeller: true,
  },
  {
    id: '3',
    sku: 'BRK-BBK-6P',
    name: 'KSR 6-Piston Big Brake Kit',
    slug: 'ksr-bbk-6p',
    price: 1899.00,
    image: brakeImage,
    category: 'brakes',
    brand: 'KSR',
    stock: 8,
    description: 'Ultimate stopping power with our 6-piston forged calipers and 355mm two-piece floating rotors. Includes pads and lines.',
    specs: {
      'Caliper Type': '6-Piston Forged Monoblock',
      'Rotor Size': '355mm x 32mm',
      'Rotor Type': 'Slotted / Drilled',
      'Pad Material': 'Ceramic',
    },
    fitment: ['BMW E46 M3', 'BMW E92 M3'],
    isNew: true,
    isBestSeller: false,
  },
  {
    id: '4',
    sku: 'TRB-BW-S366',
    name: 'BorgWarner S366 SX-E Turbo',
    slug: 'borgwarner-s366-sxe',
    price: 950.00,
    image: turboImage,
    category: 'turbochargers',
    brand: 'BorgWarner',
    stock: 12,
    description: 'The S300SX-E series is designed for competitive motorsports. High flow, durability, and response.',
    specs: {
      'Horsepower Rating': '320 - 800 HP',
      'Compressor Wheel': '66mm',
      'Turbine Wheel': '80mm',
    },
    fitment: ['Universal'],
    isNew: false,
    isBestSeller: true,
  },
  {
    id: '5',
    sku: 'EXH-TI-GTR',
    name: 'Titanium Exhaust System - R35 GT-R',
    slug: 'titanium-exhaust-r35',
    price: 3200.00,
    image: turboImage, // Placeholder
    category: 'exhaust',
    brand: 'HKS',
    stock: 2,
    description: 'Full titanium exhaust system for the Nissan GT-R R35. Extremely lightweight and aggressive sound.',
    specs: {
      'Material': 'Titanium',
      'Pipe Diameter': '102mm',
      'Weight': '8.5kg',
    },
    fitment: ['Nissan GT-R R35 (2009+)'],
    isNew: true,
    isBestSeller: false,
  }
];

export const heroSlides = [
  {
    id: 1,
    image: heroImage,
    title: "PRECISION ENGINEERED POWER",
    subtitle: "New Gen II Turbochargers In Stock",
    cta: "SHOP TURBOS",
    link: "/category/turbochargers"
  },
  {
    id: 2,
    image: heroImage, // Reusing for now
    title: "TRACK READY COOLING",
    subtitle: "Intercoolers & Radiators for Competition",
    cta: "SHOP COOLING",
    link: "/category/cooling"
  }
];
