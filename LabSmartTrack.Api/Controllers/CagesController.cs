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
    public class CagesController : ControllerBase
    {
        private readonly LabSmartTrackDbContext _context;

        public CagesController(LabSmartTrackDbContext context)
        {
            _context = context;
        }

        // GET: api/Cages
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cage>>> GetCages()
        {
            return await _context.Cages.ToListAsync();
        }

        // GET: api/Cages/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Cage>> GetCage(int id)
        {
            var cage = await _context.Cages.FindAsync(id);

            if (cage == null)
            {
                return NotFound();
            }

            return cage;
        }

        // PUT: api/Cages/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCage(int id, Cage cage)
        {
            if (id != cage.Id)
            {
                return BadRequest();
            }

            _context.Entry(cage).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CageExists(id))
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

        // POST: api/Cages
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Cage>> PostCage(Cage cage)
        {
            _context.Cages.Add(cage);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetCage", new { id = cage.Id }, cage);
        }

        // DELETE: api/Cages/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCage(int id)
        {
            var cage = await _context.Cages.FindAsync(id);
            if (cage == null)
            {
                return NotFound();
            }

            _context.Cages.Remove(cage);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CageExists(int id)
        {
            return _context.Cages.Any(e => e.Id == id);
        }
    }
}
