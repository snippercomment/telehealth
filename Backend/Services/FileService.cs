namespace Backend.Services
{
    public interface IFileService
    {
        Task<string> SaveImageAsync(IFormFile imageFile);
        void DeleteImage(string imagePath);
    }
    public class FileService :IFileService
    {
        private readonly IWebHostEnvironment _environment;
        private const string UPLOAD_FOLDER = "uploads/doctors";

        public FileService(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        public async Task<string> SaveImageAsync(IFormFile imageFile)
        {
            if (imageFile == null) return null;

            var uploadPath = Path.Combine(_environment.WebRootPath, UPLOAD_FOLDER);
            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            var fileName = $"{Guid.NewGuid()}_{imageFile.FileName}";
            var filePath = Path.Combine(uploadPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await imageFile.CopyToAsync(stream);
            }

            return Path.Combine(UPLOAD_FOLDER, fileName);
        }

        public void DeleteImage(string imagePath)
        {
            if (string.IsNullOrEmpty(imagePath)) return;

            var fullPath = Path.Combine(_environment.WebRootPath, imagePath);
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }
        }


    }
}
