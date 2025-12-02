# Genomics API Backend Template

This document provides a template for building the genomics API backend that the Progenics AI application expects.

## API Endpoints

### Health Check
```
GET /api/health
Response: { status: "ok" }
```

### Variants

#### Search Variants
```
GET /api/variants/search?q=BRCA1

Response:
{
  "variants": [
    {
      "id": "BRCA1_c.68_69delAG",
      "gene": "BRCA1",
      "chromosome": "17",
      "position": 41196312,
      "hgvs": "c.68_69delAG",
      "pathogenicity": "Pathogenic",
      "frequency": 0.0001,
      "inheritance": "Autosomal Dominant",
      "clinicalSignificance": "High risk for breast and ovarian cancer",
      "databases": ["ClinVar", "COSMIC", "dbSNP"],
      "references": ["PMID:12345678"]
    }
  ]
}
```

#### Get Variant Details
```
GET /api/variants/BRCA1_c.68_69delAG

Response:
{
  "id": "BRCA1_c.68_69delAG",
  "gene": "BRCA1",
  "chromosome": "17",
  "position": 41196312,
  "hgvs": "c.68_69delAG",
  "pathogenicity": "Pathogenic",
  "frequency": 0.0001,
  "inheritance": "Autosomal Dominant",
  "clinicalSignificance": "High risk for breast and ovarian cancer",
  "databases": ["ClinVar", "COSMIC", "dbSNP"],
  "references": ["PMID:12345678"],
  "phenotypes": ["Breast cancer", "Ovarian cancer"],
  "inheritance_pattern": "Autosomal dominant",
  "penetrance": 0.72
}
```

### Diseases

#### Search Diseases
```
GET /api/diseases/search?q=breast%20cancer

Response:
{
  "diseases": [
    {
      "id": "OMIM:114480",
      "name": "Breast Cancer, Susceptibility to, BRCA1-Related",
      "omim": "114480",
      "icd10": "C50",
      "inheritance": "Autosomal Dominant",
      "genes": ["BRCA1", "BRCA2"],
      "prevalence": 0.001,
      "description": "Hereditary breast and ovarian cancer syndrome"
    }
  ]
}
```

#### Get Disease Details
```
GET /api/diseases/OMIM:114480

Response:
{
  "id": "OMIM:114480",
  "name": "Breast Cancer, Susceptibility to, BRCA1-Related",
  "omim": "114480",
  "icd10": "C50",
  "inheritance": "Autosomal Dominant",
  "genes": ["BRCA1", "BRCA2"],
  "prevalence": 0.001,
  "description": "Hereditary breast and ovarian cancer syndrome",
  "clinical_features": [
    "Early-onset breast cancer",
    "Ovarian cancer",
    "Pancreatic cancer"
  ],
  "diagnostic_criteria": "Genetic testing for BRCA1/BRCA2 mutations",
  "management": "Surveillance, preventive surgery, chemotherapy",
  "prognosis": "Variable depending on stage at diagnosis"
}
```

### Diagnostic Tests

#### Search Tests
```
GET /api/tests/search?q=BRCA%20screening

Response:
{
  "tests": [
    {
      "id": "TEST_BRCA_PANEL",
      "name": "BRCA1/BRCA2 Comprehensive Panel",
      "type": "Genetic Testing",
      "genes": ["BRCA1", "BRCA2"],
      "methodology": "Next-Generation Sequencing",
      "turnaround_time": "10-14 days",
      "cost": 2000,
      "indication": "Hereditary breast and ovarian cancer syndrome"
    }
  ]
}
```

#### Get Test Details
```
GET /api/tests/TEST_BRCA_PANEL

Response:
{
  "id": "TEST_BRCA_PANEL",
  "name": "BRCA1/BRCA2 Comprehensive Panel",
  "type": "Genetic Testing",
  "genes": ["BRCA1", "BRCA2"],
  "methodology": "Next-Generation Sequencing",
  "turnaround_time": "10-14 days",
  "cost": 2000,
  "indication": "Hereditary breast and ovarian cancer syndrome",
  "sample_type": "Blood",
  "sample_volume": "5-10 mL",
  "sensitivity": 0.99,
  "specificity": 0.99,
  "coverage": "Exons and introns",
  "interpretation": "Pathogenic, Likely Pathogenic, Uncertain Significance, Likely Benign, Benign"
}
```

### Associations

#### Get Variant-Disease Associations
```
GET /api/associations/variant/BRCA1_c.68_69delAG

Response:
{
  "variant_id": "BRCA1_c.68_69delAG",
  "diseases": [
    {
      "disease_id": "OMIM:114480",
      "disease_name": "Breast Cancer, Susceptibility to, BRCA1-Related",
      "clinical_significance": "Pathogenic",
      "evidence": "Strong evidence from multiple studies"
    }
  ]
}
```

#### Get Disease Tests
```
GET /api/diseases/OMIM:114480/tests

Response:
{
  "disease_id": "OMIM:114480",
  "disease_name": "Breast Cancer, Susceptibility to, BRCA1-Related",
  "recommended_tests": [
    {
      "test_id": "TEST_BRCA_PANEL",
      "test_name": "BRCA1/BRCA2 Comprehensive Panel",
      "priority": "High",
      "indication": "First-line genetic testing"
    },
    {
      "test_id": "TEST_BRCA_TARGETED",
      "test_name": "BRCA1/BRCA2 Targeted Mutation Analysis",
      "priority": "Medium",
      "indication": "When specific mutation is known"
    }
  ]
}
```

## Sample Node.js/Express Implementation

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Sample data
const variantsDB = {
  'BRCA1_c.68_69delAG': {
    id: 'BRCA1_c.68_69delAG',
    gene: 'BRCA1',
    chromosome: '17',
    position: 41196312,
    hgvs: 'c.68_69delAG',
    pathogenicity: 'Pathogenic',
    frequency: 0.0001,
    inheritance: 'Autosomal Dominant',
    clinicalSignificance: 'High risk for breast and ovarian cancer'
  }
};

const diseasesDB = {
  'OMIM:114480': {
    id: 'OMIM:114480',
    name: 'Breast Cancer, Susceptibility to, BRCA1-Related',
    omim: '114480',
    icd10: 'C50',
    inheritance: 'Autosomal Dominant',
    genes: ['BRCA1', 'BRCA2'],
    prevalence: 0.001
  }
};

const testsDB = {
  'TEST_BRCA_PANEL': {
    id: 'TEST_BRCA_PANEL',
    name: 'BRCA1/BRCA2 Comprehensive Panel',
    type: 'Genetic Testing',
    genes: ['BRCA1', 'BRCA2'],
    methodology: 'Next-Generation Sequencing',
    turnaround_time: '10-14 days',
    cost: 2000
  }
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Variants endpoints
app.get('/api/variants/search', (req, res) => {
  const query = req.query.q?.toLowerCase() || '';
  const results = Object.values(variantsDB).filter(v => 
    v.gene.toLowerCase().includes(query) || 
    v.hgvs.toLowerCase().includes(query)
  );
  res.json({ variants: results });
});

app.get('/api/variants/:id', (req, res) => {
  const variant = variantsDB[req.params.id];
  if (variant) {
    res.json(variant);
  } else {
    res.status(404).json({ error: 'Variant not found' });
  }
});

// Diseases endpoints
app.get('/api/diseases/search', (req, res) => {
  const query = req.query.q?.toLowerCase() || '';
  const results = Object.values(diseasesDB).filter(d => 
    d.name.toLowerCase().includes(query)
  );
  res.json({ diseases: results });
});

app.get('/api/diseases/:id', (req, res) => {
  const disease = diseasesDB[req.params.id];
  if (disease) {
    res.json(disease);
  } else {
    res.status(404).json({ error: 'Disease not found' });
  }
});

// Tests endpoints
app.get('/api/tests/search', (req, res) => {
  const query = req.query.q?.toLowerCase() || '';
  const results = Object.values(testsDB).filter(t => 
    t.name.toLowerCase().includes(query) || 
    t.genes.some(g => g.toLowerCase().includes(query))
  );
  res.json({ tests: results });
});

app.get('/api/tests/:id', (req, res) => {
  const test = testsDB[req.params.id];
  if (test) {
    res.json(test);
  } else {
    res.status(404).json({ error: 'Test not found' });
  }
});

// Associations
app.get('/api/associations/variant/:id', (req, res) => {
  res.json({
    variant_id: req.params.id,
    diseases: [
      {
        disease_id: 'OMIM:114480',
        disease_name: 'Breast Cancer, Susceptibility to, BRCA1-Related',
        clinical_significance: 'Pathogenic'
      }
    ]
  });
});

app.get('/api/diseases/:id/tests', (req, res) => {
  res.json({
    disease_id: req.params.id,
    recommended_tests: Object.values(testsDB)
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Genomics API running on http://localhost:${PORT}`);
});
```

## Integration with Real Databases

For production, integrate with:

1. **ClinVar** - NCBI's database of clinically relevant variants
2. **OMIM** - Online Mendelian Inheritance in Man
3. **dbSNP** - Single Nucleotide Polymorphism database
4. **COSMIC** - Catalogue of Somatic Mutations in Cancer
5. **UniProt** - Protein sequence and function database
6. **Ensembl** - Genome browser and annotation database

## Error Handling

All endpoints should return appropriate HTTP status codes:
- 200: Success
- 400: Bad request
- 404: Not found
- 500: Server error

Example error response:
```json
{
  "error": "Invalid query parameter",
  "message": "Query parameter 'q' is required"
}
```
