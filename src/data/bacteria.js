/**
 * Bacteria & Strain Database
 *
 * Structure: species → strains → fermentation profiles, benefits, synergies
 * This is the core scientific data that powers the app.
 */

const bacteriaDatabase = {
  "Lactobacillus reuteri": {
    id: "l-reuteri",
    species: "Lactobacillus reuteri",
    genus: "Lactobacillus",
    grampStain: "Positive",
    shape: "Rod",
    oxygenRequirement: "Anaerobic / Microaerophilic",
    generalDescription:
      "L. reuteri is one of the few truly autochthonous Lactobacillus species in the human gut. It produces reuterin (3-hydroxypropionaldehyde), a broad-spectrum antimicrobial compound. It colonises the upper GI tract and has been studied extensively for immune modulation, oral health, and histamine production.",
    strains: {
      "DSM 6475": {
        id: "dsm-6475",
        name: "DSM 6475",
        alternateNames: ["ATCC PTA 6475", "MM4-1A"],
        origin: "Human breast milk",
        documentedBenefits: [
          "Increases endogenous oxytocin levels",
          "Promotes wound healing acceleration",
          "Supports bone density maintenance",
          "Reduces systemic inflammation (TNF-α suppression)",
          "Improves skin thickness and hair follicle health",
          "Modulates immune response via Treg cells",
          "Produces histamine — supports immune signalling",
          "May reduce age-related muscle wasting (sarcopenia)"
        ],
        mechanismsOfAction: [
          "Upregulates oxytocin via vagus nerve signalling",
          "Suppresses NF-κB pathway, lowering TNF-α",
          "Produces reuterin — antimicrobial compound",
          "Induces CD4+Foxp3+ regulatory T cells in gut-associated lymphoid tissue",
          "Converts L-histidine to histamine via histidine decarboxylase"
        ],
        survivalCharacteristics: {
          acidTolerance: "Survives pH 2.0–3.0 for 2+ hours",
          bileTolerance: "Tolerates 0.3% bile salts",
          shelfStability: "Moderate — best stored refrigerated or freeze-dried",
          heatSensitivity: "Dies above 50°C; optimal 37°C"
        },
        consumption: {
          bestTiming: "Empty stomach or 30 min before meals",
          optimalDosage: "1–10 billion CFU/day",
          notes:
            "Higher doses (5–10B) studied for oxytocin and bone effects. Take with water, not hot beverages. Some studies used twice-daily dosing.",
          deliveryForms: [
            { form: "Yogurt / fermented milk", efficacy: "Excellent — protective matrix, slow release" },
            { form: "Liquid ferment", efficacy: "Very good — high viable count if fresh" },
            { form: "Capsule (freeze-dried)", efficacy: "Good — convenient, stable" },
            { form: "Powder (sachet)", efficacy: "Good — mix with cool liquid before consumption" }
          ]
        },
        fermentation: {
          optimalTemp: 37,
          tempRange: [33, 40],
          optimalDuration: 36,
          durationRange: [24, 48],
          oxygenRequirement: "Anaerobic preferred; tolerates microaerobic",
          optimalPH: [5.0, 6.5],
          finalPH: [3.8, 4.5],
          lagPhase: 4,
          logPhaseStart: 6,
          stationaryPhaseStart: 30,
          doublingTimeMinutes: 60,
          maxCFUperML: 3e9,
          mediumProfiles: {
            milk: {
              name: "Whole Milk",
              compatibility: "perfect",
              compatibilityScore: 95,
              explanation:
                "Milk provides lactose as a fermentable sugar, casein as nitrogen source, natural buffering from calcium and phosphate, and fat for membrane integrity. L. reuteri thrives in dairy environments.",
              initialPH: 6.7,
              finalPH: 4.2,
              additives: [
                {
                  name: "Inulin",
                  recommendedAmount: "10–15 g per litre",
                  mechanism: "Prebiotic fibre selectively fermented by L. reuteri. Provides fructooligosaccharides that extend the log phase and increase total biomass.",
                  category: "carbohydrate availability",
                  estimatedGrowthBoost: 20
                },
                {
                  name: "Heavy Cream",
                  recommendedAmount: "100–150 ml per litre (replace equivalent milk volume)",
                  mechanism: "Increases fat content to 10–15%. Fat globules buffer acid production, slowing pH drop and extending the growth window. Lipids also serve as membrane building blocks.",
                  category: "fat buffering",
                  estimatedGrowthBoost: 15
                },
                {
                  name: "Whey Protein Isolate",
                  recommendedAmount: "10–20 g per litre",
                  mechanism: "Provides readily available branched-chain amino acids and peptides. Supports nitrogen requirements during rapid multiplication without adding excess carbohydrates.",
                  category: "nitrogen/protein support",
                  estimatedGrowthBoost: 10
                },
                {
                  name: "Sucrose",
                  recommendedAmount: "5–10 g per litre",
                  mechanism: "Quickly metabolised simple sugar providing an initial energy burst. Helps reduce lag phase when used alongside lactose.",
                  category: "carbohydrate availability",
                  estimatedGrowthBoost: 8
                }
              ]
            },
            heavy_cream: {
              name: "Heavy Cream (pure)",
              compatibility: "good",
              compatibilityScore: 80,
              explanation:
                "High fat content provides excellent acid buffering and membrane lipids. Lower lactose and protein content compared to milk may limit peak biomass. Best blended with a nitrogen source.",
              initialPH: 6.5,
              finalPH: 4.5,
              additives: [
                {
                  name: "Inulin",
                  recommendedAmount: "15–20 g per litre",
                  mechanism: "Critical in cream-only ferments — provides the primary fermentable carbohydrate source since cream has very little lactose.",
                  category: "carbohydrate availability",
                  estimatedGrowthBoost: 30
                },
                {
                  name: "Whey Protein Isolate",
                  recommendedAmount: "15–25 g per litre",
                  mechanism: "Essential nitrogen supplement. Pure cream lacks sufficient protein for sustained bacterial growth. WPI provides amino acids and peptides.",
                  category: "nitrogen/protein support",
                  estimatedGrowthBoost: 25
                },
                {
                  name: "Sucrose",
                  recommendedAmount: "10–15 g per litre",
                  mechanism: "Provides rapidly available simple sugar to compensate for near-zero lactose in cream.",
                  category: "carbohydrate availability",
                  estimatedGrowthBoost: 15
                }
              ]
            },
            orange_juice: {
              name: "Orange Juice",
              compatibility: "good",
              compatibilityScore: 70,
              explanation:
                "Rich in simple sugars (fructose, glucose, sucrose) and vitamin C. Naturally acidic (pH ~3.5–4.0) which may stress cells initially, but L. reuteri's acid tolerance allows adaptation. Citric acid provides some buffering. No fat or protein — supplementation needed.",
              initialPH: 3.8,
              finalPH: 3.4,
              additives: [
                {
                  name: "Inulin",
                  recommendedAmount: "15–20 g per litre",
                  mechanism: "Adds prebiotic fibre and a slower-fermenting carbohydrate source alongside the fast-metabolised fruit sugars. Extends growth phase duration.",
                  category: "carbohydrate availability",
                  estimatedGrowthBoost: 18
                },
                {
                  name: "Whey Protein Isolate",
                  recommendedAmount: "15–20 g per litre",
                  mechanism: "OJ has essentially zero protein. WPI provides essential amino acids and nitrogen for cell division. Also adds slight buffering capacity.",
                  category: "nitrogen/protein support",
                  estimatedGrowthBoost: 22
                },
                {
                  name: "Sodium Bicarbonate",
                  recommendedAmount: "1–2 g per litre",
                  mechanism: "Raises initial pH from ~3.8 to ~4.5–5.0, reducing acid stress during lag phase and improving initial survival rate.",
                  category: "pH stabilization",
                  estimatedGrowthBoost: 15
                },
                {
                  name: "Heavy Cream",
                  recommendedAmount: "30–50 ml per litre",
                  mechanism: "Adds fat for membrane synthesis and acid buffering. Small amount won't curdle significantly in acidic juice.",
                  category: "fat buffering",
                  estimatedGrowthBoost: 10
                }
              ]
            },
            cabbage_juice: {
              name: "Cabbage Juice",
              compatibility: "acceptable",
              compatibilityScore: 55,
              explanation:
                "Contains natural sugars, vitamins, and minerals. pH is near-neutral (~6.0–6.5) which is favorable. However, cabbage contains natural antimicrobial compounds (isothiocyanates from glucosinolates) that can inhibit some bacteria. Low protein and fat content.",
              initialPH: 6.2,
              finalPH: 4.0,
              additives: [
                {
                  name: "Inulin",
                  recommendedAmount: "15–20 g per litre",
                  mechanism: "Supplements the limited natural sugars in cabbage juice. Provides sustained fermentable substrate.",
                  category: "carbohydrate availability",
                  estimatedGrowthBoost: 22
                },
                {
                  name: "Whey Protein Isolate",
                  recommendedAmount: "15–20 g per litre",
                  mechanism: "Cabbage juice has minimal protein. WPI provides essential nitrogen for bacterial growth.",
                  category: "nitrogen/protein support",
                  estimatedGrowthBoost: 20
                },
                {
                  name: "Sucrose",
                  recommendedAmount: "10–15 g per litre",
                  mechanism: "Compensates for low natural sugar content. Provides quick energy source.",
                  category: "carbohydrate availability",
                  estimatedGrowthBoost: 12
                }
              ]
            },
            carrot_juice: {
              name: "Carrot Juice",
              compatibility: "good",
              compatibilityScore: 68,
              explanation:
                "Naturally sweet with moderate sugar content (mostly sucrose). pH around 6.0–6.5 is favorable. Rich in beta-carotene and minerals. Good natural buffering. Low in protein and fat.",
              initialPH: 6.2,
              finalPH: 3.9,
              additives: [
                {
                  name: "Inulin",
                  recommendedAmount: "12–18 g per litre",
                  mechanism: "Supplements natural sugars. Carrots already contain some prebiotic fibres, so slightly less inulin is needed.",
                  category: "carbohydrate availability",
                  estimatedGrowthBoost: 18
                },
                {
                  name: "Whey Protein Isolate",
                  recommendedAmount: "15–20 g per litre",
                  mechanism: "Provides essential nitrogen source absent in carrot juice.",
                  category: "nitrogen/protein support",
                  estimatedGrowthBoost: 20
                },
                {
                  name: "Heavy Cream",
                  recommendedAmount: "30–50 ml per litre",
                  mechanism: "Adds fat for membrane synthesis. Also enhances beta-carotene absorption (fat-soluble).",
                  category: "fat buffering",
                  estimatedGrowthBoost: 10
                }
              ]
            },
            grapefruit_juice: {
              name: "Grapefruit Juice",
              compatibility: "poor",
              compatibilityScore: 35,
              explanation:
                "Very acidic (pH ~3.0–3.3) with high citric acid content. Contains naringin and other flavanones that have documented antimicrobial properties. The combination of extreme acidity and antimicrobial compounds makes this a hostile environment. Significant pH adjustment required.",
              initialPH: 3.2,
              finalPH: 3.0,
              additives: [
                {
                  name: "Sodium Bicarbonate",
                  recommendedAmount: "3–5 g per litre",
                  mechanism: "Critical — must raise pH to at least 4.5 for any meaningful growth. Without pH adjustment, most cells will die during inoculation.",
                  category: "pH stabilization",
                  estimatedGrowthBoost: 40
                },
                {
                  name: "Inulin",
                  recommendedAmount: "20 g per litre",
                  mechanism: "Provides fermentable substrate and may partially bind some antimicrobial compounds.",
                  category: "carbohydrate availability",
                  estimatedGrowthBoost: 15
                },
                {
                  name: "Whey Protein Isolate",
                  recommendedAmount: "20–25 g per litre",
                  mechanism: "Provides nitrogen and adds buffering capacity through protein's amphoteric nature.",
                  category: "nitrogen/protein support",
                  estimatedGrowthBoost: 18
                }
              ]
            },
            pineapple_juice: {
              name: "Pineapple Juice",
              compatibility: "acceptable",
              compatibilityScore: 50,
              explanation:
                "Moderately acidic (pH ~3.4–3.7) with high sugar content. Contains bromelain (proteolytic enzyme) which can affect bacterial surface proteins but breaks down during fermentation. Good sugar profile but needs pH management.",
              initialPH: 3.5,
              finalPH: 3.2,
              additives: [
                {
                  name: "Sodium Bicarbonate",
                  recommendedAmount: "2–3 g per litre",
                  mechanism: "Raises pH to a more tolerable range (~4.5). Reduces acid stress during critical lag phase.",
                  category: "pH stabilization",
                  estimatedGrowthBoost: 25
                },
                {
                  name: "Inulin",
                  recommendedAmount: "10–15 g per litre",
                  mechanism: "Supplements the already-high sugar content with a slower-fermenting prebiotic source.",
                  category: "carbohydrate availability",
                  estimatedGrowthBoost: 12
                },
                {
                  name: "Whey Protein Isolate",
                  recommendedAmount: "15–20 g per litre",
                  mechanism: "Essential nitrogen source. The bromelain may actually help pre-digest the protein into more accessible peptides.",
                  category: "nitrogen/protein support",
                  estimatedGrowthBoost: 18
                }
              ]
            },
            apple_juice: {
              name: "Apple Juice",
              compatibility: "good",
              compatibilityScore: 72,
              explanation:
                "Moderate acidity (pH ~3.5–4.0), rich in fructose and glucose. Contains malic acid which some lactobacilli can metabolize (malolactic fermentation). Good sugar profile, gentle antimicrobial load. Low protein and fat.",
              initialPH: 3.7,
              finalPH: 3.4,
              additives: [
                {
                  name: "Inulin",
                  recommendedAmount: "12–15 g per litre",
                  mechanism: "Complements natural apple sugars with a slow-release prebiotic. Apple juice already has good sugar content.",
                  category: "carbohydrate availability",
                  estimatedGrowthBoost: 15
                },
                {
                  name: "Whey Protein Isolate",
                  recommendedAmount: "15–20 g per litre",
                  mechanism: "Provides essential nitrogen absent in apple juice. Peptides support rapid cell division.",
                  category: "nitrogen/protein support",
                  estimatedGrowthBoost: 20
                },
                {
                  name: "Sodium Bicarbonate",
                  recommendedAmount: "1–2 g per litre",
                  mechanism: "Mild pH adjustment to reduce initial acid stress. Apple juice is less acidic than citrus, so less correction needed.",
                  category: "pH stabilization",
                  estimatedGrowthBoost: 10
                }
              ]
            },
            grape_juice: {
              name: "Grape Juice",
              compatibility: "good",
              compatibilityScore: 65,
              explanation:
                "Good sugar content (glucose and fructose). Moderate acidity (pH ~3.3–3.8). Contains polyphenols (resveratrol, anthocyanins) which have mild antimicrobial effects but also potential prebiotic-like activity. Tartaric acid provides unique buffering.",
              initialPH: 3.5,
              finalPH: 3.2,
              additives: [
                {
                  name: "Inulin",
                  recommendedAmount: "12–15 g per litre",
                  mechanism: "Supplements natural sugars with prebiotic fibre. Polyphenols in grape juice may actually enhance inulin's prebiotic effect.",
                  category: "carbohydrate availability",
                  estimatedGrowthBoost: 16
                },
                {
                  name: "Whey Protein Isolate",
                  recommendedAmount: "15–20 g per litre",
                  mechanism: "Essential nitrogen source. Proteins may bind some polyphenols, reducing their antimicrobial impact.",
                  category: "nitrogen/protein support",
                  estimatedGrowthBoost: 20
                },
                {
                  name: "Sodium Bicarbonate",
                  recommendedAmount: "1–3 g per litre",
                  mechanism: "Adjusts pH upward to reduce acid stress. Tartaric acid in grapes provides natural buffering that works with the bicarbonate.",
                  category: "pH stabilization",
                  estimatedGrowthBoost: 12
                }
              ]
            }
          },
          starterMode: {
            lagPhaseReduction: 70,
            timeReduction: 25,
            notes:
              "Using a 36h active starter culture dramatically reduces lag phase from ~4h to ~1h. Bacteria are already in active/stationary phase and pre-adapted to the medium. Fermentation can typically be shortened by 25% while achieving similar or higher final CFU counts."
          }
        },
        synergies: [
          {
            strain: "Lactobacillus reuteri ATCC PTA 5289",
            species: "Lactobacillus reuteri",
            benefits: [
              "Complementary oral health effects — 5289 targets S. mutans",
              "Combined oxytocin and anti-inflammatory pathways",
              "Both produce reuterin, increasing total antimicrobial output"
            ]
          },
          {
            strain: "Bifidobacterium longum BB536",
            species: "Bifidobacterium longum",
            benefits: [
              "Improved gut barrier integrity via complementary mechanisms",
              "B. longum produces acetate which cross-feeds L. reuteri",
              "Combined mood modulation — GABA production + oxytocin upregulation",
              "Broader spectrum of pathogen inhibition"
            ]
          },
          {
            strain: "Lactobacillus gasseri BNR17",
            species: "Lactobacillus gasseri",
            benefits: [
              "Synergistic weight management support",
              "Complementary immune modulation",
              "Both thrive at 37°C — can be co-fermented"
            ]
          }
        ],
        supplementCompatibility: [
          {
            name: "Vitamin D3",
            category: "micronutrient",
            benefit: "Enhances L. reuteri's bone density effects. Vitamin D receptor activation synergises with oxytocin-mediated osteoblast stimulation.",
            timing: "Take together"
          },
          {
            name: "Omega-3 (EPA/DHA)",
            category: "fat",
            benefit: "Anti-inflammatory synergy. Omega-3 and reuteri both suppress TNF-α through complementary pathways.",
            timing: "Take together or same meal"
          },
          {
            name: "Inulin / FOS",
            category: "prebiotic",
            benefit: "Selective substrate for L. reuteri. Extends colonisation duration and promotes in-vivo proliferation.",
            timing: "Take together"
          },
          {
            name: "L-Histidine",
            category: "amino acid",
            benefit: "Substrate for histamine production by L. reuteri 6475's histidine decarboxylase. May enhance immune signalling effects.",
            timing: "Take together"
          },
          {
            name: "Polyphenols (green tea, berries)",
            category: "polyphenol",
            benefit: "Prebiotic-like activity supports L. reuteri growth. Polyphenol metabolites may enhance reuterin production.",
            timing: "Take at different times (2h apart) — some polyphenols are mildly antimicrobial in high concentrations"
          },
          {
            name: "Magnesium",
            category: "micronutrient",
            benefit: "Supports enzymatic reactions in L. reuteri metabolism. May enhance oxytocin signalling downstream.",
            timing: "Take together"
          }
        ]
      },
      "ATCC PTA 5289": {
        id: "atcc-pta-5289",
        name: "ATCC PTA 5289",
        alternateNames: [],
        origin: "Human oral cavity",
        documentedBenefits: [
          "Inhibits Streptococcus mutans (cavity-causing bacteria)",
          "Reduces gingival inflammation and bleeding",
          "Improves overall oral microbiome balance",
          "Reduces plaque formation",
          "Produces reuterin in the oral cavity"
        ],
        mechanismsOfAction: [
          "Competitive exclusion of S. mutans from tooth surfaces",
          "Reuterin production inhibits oral pathogens",
          "Reduces pro-inflammatory cytokines in gingival tissue",
          "Co-aggregation with oral pathogens preventing biofilm formation"
        ],
        survivalCharacteristics: {
          acidTolerance: "Survives pH 2.5–3.5",
          bileTolerance: "Tolerates 0.3% bile salts",
          shelfStability: "Good — survives well in freeze-dried form",
          heatSensitivity: "Sensitive above 45°C; optimal 37°C"
        },
        consumption: {
          bestTiming: "After brushing teeth, before bed, or after meals",
          optimalDosage: "200 million – 2 billion CFU/day",
          notes:
            "For oral health, lozenges or slow-dissolving tablets allow prolonged oral cavity exposure. Swallowing capsules bypasses the target site. Often combined with 6475 in commercial products.",
          deliveryForms: [
            { form: "Lozenge / oral tablet", efficacy: "Excellent — direct oral cavity exposure" },
            { form: "Yogurt (held in mouth)", efficacy: "Very good — swish before swallowing" },
            { form: "Capsule (opened in mouth)", efficacy: "Good — dissolve contents in mouth" },
            { form: "Capsule (swallowed)", efficacy: "Moderate — bypasses oral cavity" }
          ]
        },
        fermentation: {
          optimalTemp: 37,
          tempRange: [33, 40],
          optimalDuration: 36,
          durationRange: [24, 48],
          oxygenRequirement: "Anaerobic preferred",
          optimalPH: [5.0, 6.5],
          finalPH: [3.8, 4.5],
          lagPhase: 4,
          logPhaseStart: 6,
          stationaryPhaseStart: 28,
          doublingTimeMinutes: 55,
          maxCFUperML: 2.5e9,
          mediumProfiles: {
            milk: {
              name: "Whole Milk",
              compatibility: "perfect",
              compatibilityScore: 93,
              explanation: "Excellent dairy fermentation with similar profile to DSM 6475.",
              initialPH: 6.7,
              finalPH: 4.2,
              additives: [
                {
                  name: "Inulin",
                  recommendedAmount: "10–15 g per litre",
                  mechanism: "Prebiotic substrate extending growth phase.",
                  category: "carbohydrate availability",
                  estimatedGrowthBoost: 18
                },
                {
                  name: "Heavy Cream",
                  recommendedAmount: "100–150 ml per litre",
                  mechanism: "Fat buffering against acid accumulation.",
                  category: "fat buffering",
                  estimatedGrowthBoost: 14
                }
              ]
            }
          },
          starterMode: {
            lagPhaseReduction: 65,
            timeReduction: 20,
            notes: "Starter culture reduces lag phase significantly. Similar behaviour to 6475 strain."
          }
        },
        synergies: [
          {
            strain: "Lactobacillus reuteri DSM 6475",
            species: "Lactobacillus reuteri",
            benefits: [
              "Classic combination for oral + systemic health",
              "Dual reuterin production for enhanced antimicrobial effect",
              "Combined in BioGaia Prodentis products"
            ]
          }
        ],
        supplementCompatibility: [
          {
            name: "Xylitol",
            category: "prebiotic",
            benefit: "Synergistic cavity prevention — xylitol inhibits S. mutans independently.",
            timing: "Can be used together (xylitol gum + reuteri lozenge)"
          },
          {
            name: "Vitamin K2",
            category: "micronutrient",
            benefit: "Supports calcium metabolism in teeth, complementing reuteri's anti-caries effects.",
            timing: "Take with meals"
          }
        ]
      },
      "MM53": {
        id: "mm53",
        name: "MM53",
        alternateNames: ["DSM 20016"],
        origin: "Human intestinal tract",
        documentedBenefits: [
          "Produces reuterin with broad antimicrobial spectrum",
          "General intestinal health maintenance",
          "Pathogen inhibition in the gut",
          "Supports healthy intestinal transit"
        ],
        mechanismsOfAction: [
          "Reuterin production from glycerol metabolism",
          "Competitive exclusion of enteric pathogens",
          "Lactic acid production maintaining low intestinal pH",
          "Mucin binding for gut wall colonisation"
        ],
        survivalCharacteristics: {
          acidTolerance: "Survives pH 2.0–3.0",
          bileTolerance: "Good tolerance to bile salts",
          shelfStability: "Moderate",
          heatSensitivity: "Optimal 37°C, sensitive above 48°C"
        },
        consumption: {
          bestTiming: "With meals for intestinal effects",
          optimalDosage: "1–5 billion CFU/day",
          notes: "Type strain of L. reuteri — less clinical data than 6475 but well-characterised genetically.",
          deliveryForms: [
            { form: "Yogurt / fermented milk", efficacy: "Excellent" },
            { form: "Capsule", efficacy: "Good" }
          ]
        },
        fermentation: {
          optimalTemp: 37,
          tempRange: [30, 42],
          optimalDuration: 30,
          durationRange: [20, 42],
          oxygenRequirement: "Anaerobic",
          optimalPH: [5.0, 6.8],
          finalPH: [3.9, 4.5],
          lagPhase: 3,
          logPhaseStart: 5,
          stationaryPhaseStart: 24,
          doublingTimeMinutes: 50,
          maxCFUperML: 3.5e9,
          mediumProfiles: {
            milk: {
              name: "Whole Milk",
              compatibility: "perfect",
              compatibilityScore: 95,
              explanation: "Excellent dairy fermenter. Type strain is well-adapted to dairy.",
              initialPH: 6.7,
              finalPH: 4.1,
              additives: [
                {
                  name: "Inulin",
                  recommendedAmount: "10–15 g per litre",
                  mechanism: "Prebiotic fibre supporting extended growth.",
                  category: "carbohydrate availability",
                  estimatedGrowthBoost: 20
                },
                {
                  name: "Heavy Cream",
                  recommendedAmount: "100 ml per litre",
                  mechanism: "Fat buffering for acid management.",
                  category: "fat buffering",
                  estimatedGrowthBoost: 12
                }
              ]
            }
          },
          starterMode: {
            lagPhaseReduction: 75,
            timeReduction: 30,
            notes: "Fast-growing type strain responds very well to active starter inoculation."
          }
        },
        synergies: [],
        supplementCompatibility: [
          {
            name: "Glycerol",
            category: "prebiotic",
            benefit: "Direct substrate for reuterin biosynthesis. Supplementing glycerol may increase antimicrobial output.",
            timing: "Take together"
          }
        ]
      }
    }
  },

  "Lactobacillus gasseri": {
    id: "l-gasseri",
    species: "Lactobacillus gasseri",
    genus: "Lactobacillus",
    grampStain: "Positive",
    shape: "Rod",
    oxygenRequirement: "Facultatively anaerobic",
    generalDescription:
      "L. gasseri is a dominant species in the human vaginal and intestinal microbiome. It has been extensively studied for weight management, metabolic health, and immune function. Produces hydrogen peroxide and bacteriocins.",
    strains: {
      BNR17: {
        id: "bnr17",
        name: "BNR17",
        alternateNames: [],
        origin: "Human breast milk",
        documentedBenefits: [
          "Reduces visceral fat and body weight",
          "Improves metabolic markers (triglycerides, glucose)",
          "Inhibits dietary fat absorption",
          "Anti-obesity effects demonstrated in clinical trials",
          "Reduces waist circumference"
        ],
        mechanismsOfAction: [
          "Downregulates lipogenic gene expression (SREBP-1c, FAS)",
          "Reduces intestinal fat absorption efficiency",
          "Produces conjugated linoleic acid (CLA) — a fat-metabolising fatty acid",
          "Modulates adipokine expression (leptin, adiponectin)"
        ],
        survivalCharacteristics: {
          acidTolerance: "Survives pH 2.5–3.0",
          bileTolerance: "Good bile salt tolerance",
          shelfStability: "Good when freeze-dried",
          heatSensitivity: "Optimal 37°C; dies above 50°C"
        },
        consumption: {
          bestTiming: "30 minutes before meals",
          optimalDosage: "5–10 billion CFU/day",
          notes: "Clinical studies used 10B CFU/day for 12 weeks. Best effects with calorie-controlled diet.",
          deliveryForms: [
            { form: "Capsule", efficacy: "Excellent — standardised dosing" },
            { form: "Fermented milk", efficacy: "Very good" },
            { form: "Powder", efficacy: "Good" }
          ]
        },
        fermentation: {
          optimalTemp: 37,
          tempRange: [33, 40],
          optimalDuration: 24,
          durationRange: [18, 36],
          oxygenRequirement: "Facultatively anaerobic",
          optimalPH: [5.5, 6.5],
          finalPH: [4.0, 4.5],
          lagPhase: 3,
          logPhaseStart: 5,
          stationaryPhaseStart: 20,
          doublingTimeMinutes: 45,
          maxCFUperML: 4e9,
          mediumProfiles: {
            milk: {
              name: "Whole Milk",
              compatibility: "perfect",
              compatibilityScore: 92,
              explanation: "Excellent dairy fermenter with fast growth in milk.",
              initialPH: 6.7,
              finalPH: 4.2,
              additives: [
                {
                  name: "Inulin",
                  recommendedAmount: "10–12 g per litre",
                  mechanism: "Prebiotic support for extended growth.",
                  category: "carbohydrate availability",
                  estimatedGrowthBoost: 18
                },
                {
                  name: "Heavy Cream",
                  recommendedAmount: "80–120 ml per litre",
                  mechanism: "Fat buffering and membrane support.",
                  category: "fat buffering",
                  estimatedGrowthBoost: 12
                }
              ]
            }
          },
          starterMode: {
            lagPhaseReduction: 70,
            timeReduction: 25,
            notes: "Responds well to active starter culture."
          }
        },
        synergies: [
          {
            strain: "Lactobacillus reuteri DSM 6475",
            species: "Lactobacillus reuteri",
            benefits: [
              "Synergistic weight management support",
              "Complementary metabolic pathway modulation",
              "Both grow optimally at 37°C"
            ]
          },
          {
            strain: "Bifidobacterium breve B-3",
            species: "Bifidobacterium breve",
            benefits: [
              "Enhanced anti-obesity effects",
              "Complementary fat metabolism modulation",
              "B. breve reduces hepatic fat while L. gasseri targets visceral fat"
            ]
          }
        ],
        supplementCompatibility: [
          {
            name: "Green Tea Extract (EGCG)",
            category: "polyphenol",
            benefit: "Synergistic fat oxidation and metabolic improvement.",
            timing: "Take with meals"
          },
          {
            name: "Conjugated Linoleic Acid (CLA)",
            category: "fat",
            benefit: "Enhances the endogenous CLA production by L. gasseri.",
            timing: "Take together"
          }
        ]
      }
    }
  },

  "Bifidobacterium longum": {
    id: "b-longum",
    species: "Bifidobacterium longum",
    genus: "Bifidobacterium",
    grampStain: "Positive",
    shape: "Branched rod (bifid)",
    oxygenRequirement: "Strictly anaerobic",
    generalDescription:
      "B. longum is one of the first colonisers of the infant gut and persists into adulthood. It is a key acetate and lactate producer, supporting gut barrier function and immune development. Requires strict anaerobic conditions for optimal growth.",
    strains: {
      BB536: {
        id: "bb536",
        name: "BB536",
        alternateNames: ["ATCC BAA-999"],
        origin: "Healthy infant intestine",
        documentedBenefits: [
          "Enhances gut barrier integrity",
          "Reduces allergy symptoms (cedar pollen, food allergies)",
          "Modulates immune response (increases IgA, balances Th1/Th2)",
          "Reduces constipation and improves bowel regularity",
          "Inhibits enteropathogenic bacteria",
          "Produces GABA (gamma-aminobutyric acid)"
        ],
        mechanismsOfAction: [
          "Strengthens tight junctions via acetate production",
          "Induces secretory IgA in gut-associated lymphoid tissue",
          "Produces acetate and lactate lowering luminal pH",
          "Competitive exclusion of E. coli and Clostridium",
          "Converts glutamate to GABA via glutamate decarboxylase"
        ],
        survivalCharacteristics: {
          acidTolerance: "Moderate — survives pH 3.0–3.5 briefly",
          bileTolerance: "Good — adapted to bile-rich intestinal environment",
          shelfStability: "Excellent in freeze-dried form",
          heatSensitivity: "Sensitive above 42°C; optimal 37°C"
        },
        consumption: {
          bestTiming: "With meals (food buffer protects from stomach acid)",
          optimalDosage: "5–50 billion CFU/day",
          notes:
            "Higher doses (20–50B) used in allergy studies. Food matrix (yogurt, milk) improves survival through stomach. Well-studied strain with strong clinical evidence.",
          deliveryForms: [
            { form: "Yogurt / fermented milk", efficacy: "Excellent — protective food matrix" },
            { form: "Capsule (enteric-coated)", efficacy: "Excellent — protects from stomach acid" },
            { form: "Powder (with food)", efficacy: "Good — mix with cool food/drink" }
          ]
        },
        fermentation: {
          optimalTemp: 37,
          tempRange: [35, 40],
          optimalDuration: 24,
          durationRange: [18, 30],
          oxygenRequirement: "Strictly anaerobic — oxygen exposure reduces viability significantly",
          optimalPH: [6.0, 7.0],
          finalPH: [4.2, 4.8],
          lagPhase: 5,
          logPhaseStart: 7,
          stationaryPhaseStart: 22,
          doublingTimeMinutes: 70,
          maxCFUperML: 2e9,
          mediumProfiles: {
            milk: {
              name: "Whole Milk",
              compatibility: "perfect",
              compatibilityScore: 90,
              explanation:
                "Milk provides lactose (which B. longum ferments well), protein, and a near-neutral pH. Requires anaerobic conditions — fill container completely to minimize headspace oxygen.",
              initialPH: 6.7,
              finalPH: 4.5,
              additives: [
                {
                  name: "Inulin",
                  recommendedAmount: "10–15 g per litre",
                  mechanism: "B. longum is a primary inulin degrader. Produces short-chain fatty acids (acetate, lactate) from inulin fermentation.",
                  category: "carbohydrate availability",
                  estimatedGrowthBoost: 25
                },
                {
                  name: "Lactulose",
                  recommendedAmount: "5–10 g per litre",
                  mechanism: "Synthetic disaccharide selectively fermented by bifidobacteria. Powerful bifidogenic factor.",
                  category: "carbohydrate availability",
                  estimatedGrowthBoost: 20
                }
              ]
            }
          },
          starterMode: {
            lagPhaseReduction: 60,
            timeReduction: 20,
            notes: "Starter helps overcome the long lag phase typical of strict anaerobes."
          }
        },
        synergies: [
          {
            strain: "Lactobacillus reuteri DSM 6475",
            species: "Lactobacillus reuteri",
            benefits: [
              "Improved gut barrier + systemic inflammation control",
              "GABA + oxytocin → mood and stress modulation",
              "Acetate from B. longum supports L. reuteri metabolism"
            ]
          }
        ],
        supplementCompatibility: [
          {
            name: "GOS (Galacto-oligosaccharides)",
            category: "prebiotic",
            benefit: "Highly selective for bifidobacteria. Dramatically increases B. longum population in vivo.",
            timing: "Take together"
          },
          {
            name: "L-Glutamine",
            category: "amino acid",
            benefit: "Substrate for GABA production and supports gut barrier repair.",
            timing: "Take together"
          }
        ]
      }
    }
  }
};

export default bacteriaDatabase;
