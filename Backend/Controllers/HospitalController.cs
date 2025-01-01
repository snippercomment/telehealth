using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [Route("api/admin/[controller]")]
    [ApiController]
    public class HospitalController : ControllerBase
    {
        private readonly IHospitalService _hospitalService;

        public HospitalController(IHospitalService hospitalService)
        {
            _hospitalService = hospitalService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Hospital>>> GetHospitals()
        {
            var hospitals = await _hospitalService.GetAllHospitalsAsync();
            return Ok(hospitals);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Hospital>> GetHospital(int id)
        {

            var hospital = await _hospitalService.GetHospitalByIdAsync(id);
            if (hospital == null) return NotFound();
            return Ok(hospital);

        }

        [HttpPost]
        public async Task<ActionResult<Hospital>> CreateHospital([FromForm] HospitalDTO hospitalDto)
        {
            var hospital = await _hospitalService.CreateHospitalAsync(hospitalDto);
            return CreatedAtAction(nameof(GetHospital), new { id = hospital.Id }, hospital);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateHospital(int id, [FromForm] HospitalDTO hospitalDto)
        {
            var hospital = await _hospitalService.UpdateHospitalAsync(id, hospitalDto);
            if (hospital == null) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHospital(int id)
        {
            await _hospitalService.DeleteHospitalAsync(id);
            return NoContent();
        }
    }
}
