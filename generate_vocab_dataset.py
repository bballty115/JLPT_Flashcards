#
# Note - Must be running VOICEVOX to generate audio (Runner in windows-cpu folder)
#
from bs4 import BeautifulSoup
import shutil
import requests
from icrawler.builtin import GoogleImageCrawler
import os
import json

# To use this, copy table from page to jlpt.html
level = 'N5'
category = 'N'
with open('jlpt.html', 'r', encoding='utf-8') as f:
    pageHtml = f.read()

# Function for getting an image and moving it to the
#  correct directory
temp_img_dir = f'./imgs/temp'

# Given a meaning, a word index, and a final image path, generate an
#  image if one does not already exist at the final location
def generateImage(meaning, index,final_img_path):
    # If this image already exists, don't generate a new image
    if os.path.exists(final_img_path):
        print(f'Image file {level}-{category}-{index} already exists.')
        return
    # Generate the crawler
    google_crawler = GoogleImageCrawler(storage={'root_dir': temp_img_dir})
    # Otherwise, generate an image to the temp folder
    google_crawler.crawl(keyword=meaning, max_num=1)
    # Attempt to get the files downloaded
    downloaded_files = os.listdir(temp_img_dir)
    # If a file was downloaded
    if downloaded_files:
        # Store the original and new name
        original_file = os.path.join(temp_img_dir, downloaded_files[0])
        new_file = os.path.join(temp_img_dir, f'{level}-{category}-{index}.jpg')
        # Rename the file
        os.rename(original_file, new_file)
        # Move it to the desired directory
        shutil.move(new_file,f'./imgs/{level}/{category}/{level}-{category}-{index}.jpg')
    else:
        print("No image downloaded.")

# Given a word, an index and a final audio path, generate an audio file
#  for this word if one does not already exist
def generateAudio(word, index, final_audio_path):
    # If this audio already exists, don't generate a new one
    if os.path.exists(final_audio_path):
        print(f'Audio file {level}-{category}-{index} already exists.')
        return
    # Select a speaker id (81, 30, 21 are good)
    speaker_id = 81
    # 1. Audio query
    query_url = f"http://127.0.0.1:50021/audio_query"
    params = {"text": word, "speaker": speaker_id}
    query_response = requests.post(query_url, params=params)
    query_response.raise_for_status()
    audio_query = query_response.json()

    # 2. Synthesis
    synthesis_url = f"http://127.0.0.1:50021/synthesis"
    synthesis_response = requests.post(
        synthesis_url,
        params={"speaker": speaker_id},
        json=audio_query
    )
    synthesis_response.raise_for_status()

    # 3. Save audio to file
    with open(final_audio_path, "wb") as f:
        f.write(synthesis_response.content)

    print(f'Audio saved for {level}-{category}-{index}.')

# Convert to a soup object
soup = BeautifulSoup(pageHtml, 'html.parser')
# Find all the rows from the table
rows = soup.find_all('tr',attrs={"class","jl-row"})
# Storage for the final vocab list
vocab_list = []
# For each row in the table
for row in rows:
    # Extract the columns from the row
    columns = row.find_all('td')
    # So long as this column has the required amount of data
    if len(columns) >= 4:
        # Extract the word, reading, and meaning
        index = columns[0].get_text(strip=True)
        word = columns[1].get_text(strip=True)
        # Attempt to extract hiragana, otherwise extract romanji
        hiragana = columns[2].find('p').get_text(strip=True)
        reading = hiragana if hiragana else columns[2].get_text(strip=True)
        meaning = columns[3].get_text(strip=True)

        # Generate mp3 for reading if it doesn't already exist
        audioOutputPath = f'./audio/{level}/{category}/{level}-{category}-{index}.mp3'
        generateAudio(hiragana if hiragana else word,index,audioOutputPath)

        # Generate and save the image for this word
        final_img_path = f'./imgs/{level}/{category}/{level}-{category}-{index}.jpg'
        generateImage(meaning, index,final_img_path)

        # Append to the vocab list
        vocab_list.append({
            'index':index,
            'word': word,
            'reading': reading,
            'meaning': meaning,
            'audio': audioOutputPath,
            'img': final_img_path
        })
        
# Save the final vocab list
start_index = vocab_list[0]['index']
end_index = vocab_list[-1]['index']
with open(f'data/{level}/{category}/{level}-{category}-{start_index}-{end_index}.json', "w", encoding="utf-8") as f:
    json.dump(vocab_list, f, ensure_ascii=False, indent=4)