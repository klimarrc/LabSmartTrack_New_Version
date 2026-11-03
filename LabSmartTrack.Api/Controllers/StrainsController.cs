using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LabSmartTrack.Api.Data;
using LabSmartTrack.Api.Models;

namespace LabSmartTrack.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StrainsController : ControllerBase
    {
        private readonly LabSmartTrackDbContext _context;

        public StrainsController(LabSmartTrackDbContext context)
        {
            _context = context;
        }

        // GET: api/Strains
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Strain>>> GetStrains()
        {
            return await _context.Strains.ToListAsync();
        }

        // GET: api/Strains/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Strain>> GetStrain(int id)
        {
            var strain = await _context.Strains.FindAsync(id);

            if (strain == null)
            {
                return NotFound();
            }

            return strain;
        }

        // PUT: api/Strains/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutStrain(int id, Strain strain)
        {
            if (id != strain.Id)
            {
                return BadRequest();
            }

            _context.Entry(strain).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!StrainExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Strains
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Strain>> PostStrain(Strain strain)
        {
            _context.Strains.Add(strain);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetStrain", new { id = strain.Id }, strain);
        }

        // DELETE: api/Strains/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStrain(int id)
        {
            var strain = await _context.Strains.FindAsync(id);
            if (strain == null)
            {
                return NotFound();
            }

            _context.Strains.Remove(strain);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool StrainExists(int id)
        {
            return _context.Strains.Any(e => e.Id == id);
        }
    }
}
