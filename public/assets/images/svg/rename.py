import os

teams = [
    'white',
    'black'
]

teams_other_ids = {
    'white': ['light', 'white'],
    'black': ['dark', 'black'],
}

pieces = [
    'pawn',
    'rook',
    'knight',
    'bishop',
    'queen',
    'king',
]

DIR = './normal'

for file in os.listdir(DIR):
    print(file)

    split_tup = os.path.splitext(file)

    image_team = None
    piece_type = None
    for team in teams:
        for team_to_check in teams_other_ids[team]:
            if team_to_check in split_tup[0].lower():
                image_team = team

    for piece_to_check in pieces:
        if piece_to_check in split_tup[0].lower():
            piece_type = piece_to_check
    
    if image_team and piece_type:
        os.rename(DIR + "/" + file, DIR + "/" + image_team + " " + piece_type + split_tup[1])